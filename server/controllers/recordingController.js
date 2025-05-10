const fs = require('fs');
const path = require('path');
const crc32 = require('buffer-crc32');
const { spawn } = require('child_process');

let isRecording = false;
let currentRecordingFile = null;
let ffmpegProcess = null;
const recordingsDir = path.join(__dirname, '../recordings');

if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

const startRecording = (req, res) => {
  if (isRecording) {
    return res.status(400).json({ success: false, message: 'Already recording' });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}.mp4`;
  currentRecordingFile = path.join(recordingsDir, filename);

  // Changement du format d'entrée pour MPEG-TS (plus adapté au streaming)
  const ffmpegArgs = [
    '-f', 'mpegts', // Format d'entrée
    '-listen', '1', // Écoute sur le port
    '-i', 'tcp://0.0.0.0:9000', // FFmpeg écoute sur ce port
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-bsf:a', 'aac_adtstoasc',
    '-movflags', 'frag_keyframe+empty_moov+faststart',
    '-y',
    currentRecordingFile
  ];

  ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

  // Gestion des erreurs améliorée
  const handleError = (err) => {
    console.error('FFmpeg Error:', err);
    isRecording = false;
    ffmpegProcess = null;
    fs.unlinkSync(currentRecordingFile); // Nettoyage du fichier corrompu
  };

  ffmpegProcess.on('error', handleError);

  ffmpegProcess.stderr.on('data', (data) => {
    console.log('[FFmpeg]', data.toString());
  });

  ffmpegProcess.on('exit', (code) => {
    console.log(`FFmpeg exited with code ${code}`);
    isRecording = false;
  });

  // Écriture directe des données sans buffer intermédiaire
  global.handleStreamData = (chunk) => {
    if (ffmpegProcess && ffmpegProcess.stdin.writable) {
      ffmpegProcess.stdin.write(chunk, (err) => {
        if (err) console.error('Write error:', err);
      });
    }
  };

  isRecording = true;
  res.json({ success: true, message: 'Recording started', filename });
};

const stopRecording = async (req, res) => {
  if (!isRecording) {
    return res.status(400).json({ success: false, message: 'Not recording' });
  }

  // Arrête FFmpeg proprement
  ffmpegProcess.on('close', () => {
    try {
      const fileBuffer = fs.readFileSync(currentRecordingFile);
      const checksum = crc32.unsigned(fileBuffer);
      const newPath = path.join(
        recordingsDir,
        `${path.basename(currentRecordingFile, '.mp4')}-${checksum}.mp4`
      );
      fs.renameSync(currentRecordingFile, newPath);

      res.json({
        success: true,
        message: 'Recording saved',
        filename: path.basename(newPath)
      });
    } catch (err) {
      console.error('Finalization error:', err);
      res.status(500).json({ success: false, message: 'File processing failed' });
    }
    isRecording = false;
    ffmpegProcess = null;
  });

  ffmpegProcess.kill('SIGINT'); // Demande à FFmpeg de s'arrêter proprement
};

const getRecordingStatus = (req, res) => {
  res.json({
    recording: isRecording,
    currentFile: isRecording ? path.basename(currentRecordingFile) : null,
  });
};

module.exports = {
  startRecording,
  stopRecording,
  getRecordingStatus,
};
