#!/usr/bin/env bash
set -euo pipefail

################################################################################
# Script de streaming vidéo et audio
#
# Description :
# Ce script configure et démarre un flux vidéo et audio en utilisant `ffmpeg`.
# Il vérifie les périphériques nécessaires, ajuste les tailles de paquets pour
# optimiser les performances réseau, et gère les flux TCP et UDP.
#
# Usage :
#   ./startStream.sh
#
# Prérequis :
#   - Ce script doit être exécuté avec des privilèges root.
#   - Les dépendances suivantes doivent être installées :
#       - ffmpeg
#       - v4l-utils
#       - alsa-utils
#   - Les périphériques vidéo et audio doivent être correctement configurés.
#
# Configuration :
#   - Adresse IP de destination : Modifiez la variable `DEST_IP`.
#   - Paramètres vidéo : Modifiez les variables `VIDEO_DEV`, `VIDEO_SIZE`, etc.
#   - Paramètres audio : Modifiez les variables `AUDIO_DEV`, `A_BITRATE`, etc.
#
# Logs :
#   Les actions et erreurs sont enregistrées dans `logs/streamer.log`.
#
# Auteur :
#   SPOC-LMSC
#
# Date :
#   15/05/2025
################################################################################


# Check if running with root privileges
if [ "$EUID" -ne 0 ]; then
  echo "🔒 This script requires root privileges to access hardware devices"
  echo "➡️ Restarting with sudo..."
  exec sudo "$0" "$@"
fi

# --- CONFIGURATION ---
# Streaming destinations
DEST_IP="10.42.192.20"

# TCP destinations
TCP_STREAM_DEST="tcp://${DEST_IP}:9000"
TCP_PKT_SIZE=1316

# UDP destinations
UDP_VIDEO_DEST="udp://${DEST_IP}:8082"
UDP_AUDIO_DEST="udp://${DEST_IP}:8083"
UDP_PKT_SIZE=1316 # Standard size to avoid fragmentation

# Video configuration
VIDEO_DEV="/dev/video0"
VIDEO_SIZE="1920x1080"
VIDEO_FRAME_RATE=60
V_BITRATE="3000k"
V_PRESET="ultrafast"
V_TUNE="zerolatency"

# Audio configuration
AUDIO_DEV="hw:1,0"
A_BITRATE="128k"
A_SAMPLE_RATE=44100
A_CHANNELS=2

# FIFO configuration
FIFO="stream_fifo.ts"
FIFO_TIMEOUT=2 # Seconds to wait for FIFO connection
# ----------------------

# Initialize logging
LOG_FILE="streamer.log"
exec > >(tee -a "$LOG_FILE") 2>&1

cleanup() {
  echo "🧹 Cleaning up..."
  # Send SIGTERM first for graceful termination
  kill -TERM "$SEND_LOOP_PID" 2>/dev/null || true
  sleep 0.5
  # Force kill if still running
  kill -9 "$SEND_LOOP_PID" 2>/dev/null || true

  [[ -p "$FIFO" ]] && rm -f "$FIFO"
  echo "✅ Cleanup complete"
  exit
}
trap cleanup INT TERM EXIT

check_devices() {
  echo "🔍 Vérification des périphériques vidéo et audio..."
  # Vérification des dépendances logicielles
  local missing_deps=()
  command -v ffmpeg >/dev/null 2>&1 || missing_deps+=("ffmpeg")
  command -v v4l2-ctl >/dev/null 2>&1 || missing_deps+=("v4l-utils")
  command -v arecord >/dev/null 2>&1 || missing_deps+=("alsa-utils")

  if [ ${#missing_deps[@]} -gt 0 ]; then
    echo "❌ Dépendances manquantes: ${missing_deps[*]}"
    echo "➡️  Installez avec: sudo apt install ${missing_deps[*]}"
    exit 1
  fi

  # Vérification du périphérique vidéo
  if [[ ! -e "$VIDEO_DEV" ]]; then
    echo "❌ Erreur Vidéo: Le périphérique $VIDEO_DEV n'existe pas"
    echo "➡️  Solutions possibles:"
    echo "   - Vérifiez la connexion de la webcam"
    echo "   - Installez les drivers nécessaires (v4l2loopback-dkms)"
    echo "   - Essayez un autre numéro de périphérique (ex: /dev/video1)"
    exit 1
  fi

  if ! v4l2-ctl --device="$VIDEO_DEV" --all >/dev/null 2>&1; then
    echo "❌ Erreur Vidéo: Le périphérique $VIDEO_DEV n'est pas un périphérique V4L2 valide"
    echo "➡️  Essayez avec: v4l2-ctl --device=$VIDEO_DEV --all pour plus de détails"
    exit 1
  fi

  # Vérification du format vidéo supporté
  if ! v4l2-ctl --device="$VIDEO_DEV" --list-formats >/dev/null 2>&1; then
    echo "❌ Erreur Vidéo: Impossible de lire les formats supportés par $VIDEO_DEV"
    exit 1
  fi

  # Vérification du périphérique audio
  if ! arecord --device="$AUDIO_DEV" -L >/dev/null 2>&1; then
    echo "❌ Erreur Audio: Le périphérique $AUDIO_DEV est introuvable ou inaccessible"
    echo "➡️  Solutions possibles:"
    echo "   - Vérifiez les câbles audio"
    echo "   - Consultez les périphériques disponibles avec: arecord -l"
    echo "   - Essayez de changer le périphérique (ex: hw:0,0)"
    echo "   - Ajoutez l'utilisateur au groupe 'audio' (sudo usermod -a -G audio \$USER)"
    exit 1
  fi

  # Test de capture audio (2 secondes en silence)
  if ! timeout 3 arecord --device="$AUDIO_DEV" --format=S16_LE --rate=44100 --channels=2 --duration=2 --vumeter=mono -N /dev/null >/dev/null 2>&1; then
    echo "❌ Erreur Audio: Impossible de capturer depuis $AUDIO_DEV"
    echo "➡️  Vérifiez les permissions et la configuration ALSA (alsamixer)"
    exit 1
  fi
}

create_fifo() {
  if [[ ! -p "$FIFO" ]]; then
    echo "🔧 Creating FIFO: $FIFO"
    mkfifo "$FIFO"
  fi
}

send_loop() {
  while true; do
    echo "🚀 Starting TCP stream to $DEST_IP (pkt_size=$TCP_PKT_SIZE)"
    # Explicitly set input format to mpegts and output to mpegts
    if ! ffmpeg -nostdin -f mpegts -i "$FIFO" \
      -c:v copy \
      -c:a aac -b:a "$A_BITRATE" -ar "$A_SAMPLE_RATE" -ac "$A_CHANNELS" \
      -f mpegts \
      -flush_packets 1 -muxdelay 0 \
      "$TCP_STREAM_DEST?pkt_size=$TCP_PKT_SIZE" \
      -loglevel quiet; then
      echo "⚠️ TCP stream interrupted (code $?), retrying in 2s..."
      sleep 2
    fi
  done
}

main_stream() {
  ffmpeg -nostdin \
    -loglevel error \
    -probesize 32 -analyzeduration 0 \
    -framerate "$VIDEO_FRAME_RATE" -fflags +genpts \
    -f v4l2 -video_size "$VIDEO_SIZE" -input_format mjpeg \
    -re \
    -thread_queue_size 512 -i "$VIDEO_DEV" \
    -f alsa -sample_rate "$A_SAMPLE_RATE" -channels "$A_CHANNELS" \
    -thread_queue_size 4096 -use_wallclock_as_timestamps 1 -i "$AUDIO_DEV" \
    -c:v libx264 -profile:v baseline -pix_fmt yuv420p \
    -preset "$V_PRESET" -tune "$V_TUNE" -x264-params keyint=60 \
    -b:v "$V_BITRATE" -fps_mode cfr \
    -c:a aac -b:a "$A_BITRATE" -ar "$A_SAMPLE_RATE" -ac "$A_CHANNELS" \
    -f adts \
    -strict experimental \
    -map 0:v -map 1:a \
    -f tee \
    "[select=v:f=h264]$UDP_VIDEO_DEST?pkt_size=$UDP_PKT_SIZE|\
[select=a:f=adts]$UDP_AUDIO_DEST?pkt_size=$UDP_PKT_SIZE|\
[f=fifo:drop_pkts_on_overflow=1:attempt_recovery=1:recovery_wait_time=2:fifo_format=mpegts]$FIFO"
}

# Function to find the optimal packet size
find_optimal_packet_size() {
  local target="$1"
  local port="${2:-8082}"
  local default_size=1316
  local min_size=576
  local max_size=60000
  local optimal_size=$default_size
  local best_throughput=0

  # Test parameters
  local test_duration=6 # seconds
  local repeats=5       # trials per size
  local test_sizes=(1316 8192 32768 16384 4096 576 60000)

  # Check required commands
  for cmd in ping socat ip awk; do
    if ! command -v "$cmd" &>/dev/null; then
      return $default_size
    fi
  done

  # Determine network interface
  local iface
  iface=$(ip route get "$target" 2>/dev/null | awk '/dev/ {print $3; exit}')
  [[ -z $iface ]] && iface=$(ip route | awk '/default/ {print $5; exit}')

  # Detect connection type and speed
  local connection="wired" speed=100 signal=""
  if [[ -d "/sys/class/net/$iface/wireless" ]] || [[ $iface == wl* ]]; then
    connection="wireless"
    if command -v iw &>/dev/null; then
      local iwout rx tx
      iwout=$(iw dev "$iface" link 2>/dev/null)
      if ! grep -q "Not connected" <<<"$iwout"; then
        rx=$(grep -Po 'rx bitrate:\s*\K[\d.]+(?= MBit/s)' <<<"$iwout")
        tx=$(grep -Po 'tx bitrate:\s*\K[\d.]+(?= MBit/s)' <<<"$iwout")
        signal=$(grep -Po 'signal:\s*\K-?\d+' <<<"$iwout")
        if [[ -n $rx && -n $tx ]]; then
          speed=$(awk "BEGIN{print ($rx<$tx)?$rx:$tx}")
        fi
      fi
    fi
  else
    if command -v ethtool &>/dev/null; then
      speed=$(ethtool "$iface" 2>/dev/null |
        grep -Po 'Speed:\s*\K\d+(?=Mb/s)' || echo "$speed")
    else
      speed=$(cat "/sys/class/net/$iface/speed" 2>/dev/null || echo "$speed")
    fi
  fi

  # Check if target is reachable
  if ! ping -c1 -W2 "$target" &>/dev/null; then
    return $default_size
  fi

  # Adjust test sizes based on connection type and speed
  if [[ $connection == wireless ]]; then
    if ((speed >= 300)); then
      test_sizes=(16384 8192 4096 2048 1316 576)
    elif ((speed >= 100)); then
      test_sizes=(8192 4096 2048 1316 576)
    else
      test_sizes=(4096 2048 1316 576)
    fi
    if [[ -n $signal && $signal -lt -70 ]]; then
      speed=$(awk "BEGIN{print $speed*0.7}")
    fi
  else
    test_sizes=(60000 32768 16384 8192 4096 1316)
  fi

  # Test packet sizes
  for s in "${test_sizes[@]}"; do
    local throughputs=()
    for run in $(seq 1 $repeats); do
      local start end elapsed sent thr
      start=$(date +%s.%N)
      if timeout $((test_duration + 1)) bash -c "\
          dd if=/dev/urandom bs=$s count=$((test_duration * 1000000 / (s * 8) + 1)) conv=fdatasync 2>/dev/null \
          | socat - udp-sendto:$target:$port 2>/dev/null"; then
        end=$(date +%s.%N)
        elapsed=$(awk "BEGIN{print $end - $start}")
        sent=$((s * (test_duration * 1000000 / (s * 8) + 1)))
        thr=$(awk "BEGIN{printf \"%.2f\", $sent/($elapsed*1024*1024)}")
        throughputs+=("$thr")
        if awk "BEGIN{exit !($thr > $best_throughput)}"; then
          best_throughput=$thr
          optimal_size=$s
        fi
      else
        throughputs+=("0")
      fi
    done
  done

  # Cap wireless packet size
  if [[ $connection == wireless && $optimal_size -gt 16384 ]]; then
    optimal_size=16384
  fi

  printf "\n✨ Optimal packet size: %d bytes (≈%.2f MB/s)\n" \
    "$optimal_size" "$best_throughput"

  return $optimal_size
}

setup_packet_sizes() {
  echo "🌐 Configuring packet sizes…"
  local dest=${DEST_IP:-"172.20.10.5"}

  # Capture the output of find_optimal_packet_size instead of its return code
  local size=$(find_optimal_packet_size "$dest" | grep -oP '(?<=Optimal packet size: )\d+')

  if ((size > 0)); then
    UDP_PKT_SIZE=$size
    echo "📦 Packet sizes set to $size bytes"
  else
    echo "⚠️ Using defaults UDP=$UDP_PKT_SIZE"
  fi
}

# --- Execution starts here ---
check_devices
create_fifo
setup_packet_sizes

# Start TCP sender in background
send_loop &
SEND_LOOP_PID=$!

# Wait briefly for FIFO connection
sleep "$FIFO_TIMEOUT"

# Start main stream
echo "🎥 Starting capture from $VIDEO_DEV ($VIDEO_SIZE @ ${VIDEO_FRAME_RATE}fps)"
echo "🎤 Starting audio capture from $AUDIO_DEV"
main_stream
