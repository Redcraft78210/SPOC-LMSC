/**
 * @fileoverview Contrôleur de gestion des enregistrements vidéo.
 * Ce module gère le démarrage, l'arrêt et la surveillance des enregistrements vidéo
 * via FFmpeg, ainsi que leur sauvegarde et catalogage dans la base de données.
 * @module recordingController
 */

const fs = require('fs');
const path = require('path');
const crc32 = require('buffer-crc32');
const { spawn, execSync } = require('child_process');

const { Video } = require('../models');

/**
 * Indique si un enregistrement est actuellement en cours
 * @type {boolean}
 */
let isRecording = false;

/**
 * Chemin du fichier d'enregistrement en cours
 * @type {string|null}
 */
let currentRecordingFile = null;

/**
 * Instance du processus FFmpeg en cours d'exécution
 * @type {import('child_process').ChildProcess|null}
 */
let ffmpegProcess = null;

/**
 * Répertoire de stockage temporaire des enregistrements
 * @type {string}
 */
const recordingsDir = path.join(__dirname, '../recordings');

/**
 * Répertoire de stockage permanent des vidéos
 * @type {string}
 */
const videosDir = path.join(__dirname, '../videos');

/**
 * Obtient la durée en secondes d'un fichier vidéo
 * @param {string} filePath - Chemin complet du fichier vidéo
 * @returns {number} Durée de la vidéo en secondes
 * @throws {Error} Si la commande FFprobe échoue
 */
function getVideoDuration(filePath) {
  const output = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
  );
  return parseInt(output, 10);
}

// Création du répertoire d'enregistrements s'il n'existe pas
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

/**
 * Démarre un nouvel enregistrement vidéo
 * @param {import('express').Request} req - Requête Express
 * @param {import('express').Response} res - Réponse Express
 * @returns {Object} Statut de l'opération et nom du fichier créé
 * @throws {Error} Si l'initialisation de FFmpeg échoue
 */
const startRecording = (req, res) => {
  if (isRecording) {
    return res.status(400).json({ success: false, message: 'Already recording' });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}.mp4`;
  currentRecordingFile = path.join(recordingsDir, filename);

  const ffmpegArgs = [
    '-hide_banner',
    '-loglevel', 'error',
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

  /**
   * Gère les erreurs du processus FFmpeg
   * @param {Error} err - Erreur survenue
   */
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

  /**
   * Fonction globale pour traiter les données de flux entrant
   * @param {Buffer} chunk - Fragment de données vidéo
   */
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

/**
 * Arrête l'enregistrement en cours et sauvegarde la vidéo
 * @param {import('express').Request} req - Requête Express
 * @param {import('express').Response} res - Réponse Express
 * @returns {Promise<Object>} Statut de l'opération et informations sur la vidéo sauvegardée
 * @throws {Error} Si le traitement du fichier échoue
 */
const stopRecording = async (req, res) => {
  if (!isRecording) {
    return res.status(400).json({ success: false, message: 'Not recording' });
  }

  ffmpegProcess.on('close', async () => {
    try {
      const fileBuffer = fs.readFileSync(currentRecordingFile);
      const checksum = crc32.unsigned(fileBuffer).toString(16);
      const videoDuration = getVideoDuration(currentRecordingFile);

      const video = new Video({
        duration: videoDuration,
        fingerprint: checksum,
        commit_msg: "Nouvel enregistrement",
      });

      const savedVideo = await video.save();

      const newPath = path.join(
        videosDir,
        `${savedVideo.id}-${checksum}.mp4`
      );

      fs.renameSync(currentRecordingFile, newPath);

      res.json({
        success: true,
        message: 'Recording saved',
        video: {
          id: savedVideo.id
        }
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

/**
 * Récupère l'état actuel de l'enregistrement
 * @param {import('express').Request} req - Requête Express
 * @param {import('express').Response} res - Réponse Express
 * @returns {Object} État de l'enregistrement et nom du fichier actuel
 */
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
