import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import "./style/plyr.css";
import Logo from "../Logo";
import { Play } from "lucide-react";

/**
 * URL de base pour les requêtes API
 * @constant {string}
 */
const BASE_URL = "/api";

/**
 * Composant de lecteur vidéo sécurisé utilisant Plyr avec authentification par token
 *
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.videoId - Identifiant unique de la vidéo à afficher
 * @param {string} props.authToken - Token d'authentification pour accéder à la vidéo
 * @param {string} [props.posterUrl] - URL optionnelle de l'image d'aperçu de la vidéo
 * @param {Function} [props.onError] - Fonction de rappel optionnelle appelée en cas d'erreur de lecture
 * @returns {JSX.Element} Composant de lecteur vidéo sécurisé
 *
 * @example
 * // Exemple d'utilisation de base
 * <SecureVideoPlayer
 *   videoId="123456"
 *   authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   posterUrl="/images/video-poster.jpg"
 *   onError={(error) => console.error("Erreur de lecture:", error)}
 * />
 */
const SecureVideoPlayer = ({ videoId, authToken, posterUrl, onError }) => {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const playerRef = useRef(null);
  const playButtonRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const src = `${BASE_URL}s/videos/${videoId}?authToken=${encodeURIComponent(
      authToken
    )}`;

    videoRef.current.innerHTML = "";
    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";
    videoRef.current.appendChild(source);

    videoRef.current.poster = posterUrl || "";

    playerRef.current = new Plyr("video", {
      controls: [
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],
      fullscreen: {
        enabled: true,
        fallback: true,
        iosNative: false,
        container: ".player-wrapper",
      },
    });

    const player = playerRef.current;

    const handlePlayPause = () => {
      if (player.paused) {
        playButtonRef.current?.removeAttribute("hidden");
      } else {
        playButtonRef.current?.setAttribute("hidden", true);
      }
    };

    player.on("play", handlePlayPause);
    player.on("pause", handlePlayPause);

    if (onError) player.on("error", onError);

    return () => {
      player.off("play", handlePlayPause);
      player.off("pause", handlePlayPause);
      if (onError) player.off("error", onError);
      player.destroy();
    };
  }, [videoId, authToken, posterUrl, onError]);

  return (
    <div
      ref={wrapperRef}
      className="player-wrapper video-player-wrapper rounded-lg overflow-hidden shadow-md relative"
    >
      <video ref={videoRef} className="plyr" playsInline />
      <button
        ref={playButtonRef}
        className="custom-play-btn"
        aria-label="Play"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          playerRef.current?.play();
        }}
      >
        <Play className="w-14 h-14" />
      </button>
      <Logo className="absolute top-0 right-4 w-30 h-30" />
    </div>
  );
};

/**
 * Validation des types de propriétés pour le composant SecureVideoPlayer
 */
SecureVideoPlayer.propTypes = {
  videoId: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
  posterUrl: PropTypes.string,
  onError: PropTypes.func,
};

export default SecureVideoPlayer;