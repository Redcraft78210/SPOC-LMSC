/**
 * @fileoverview Routes pour la gestion des enregistrements vidéo.
 * Ce module définit les endpoints REST pour démarrer, arrêter et consulter
 * le statut des enregistrements vidéo avec authentification requise.
 * @module recordingRoutes
 */

const express = require('express');
const router = express.Router();
const { startRecording, stopRecording, getRecordingStatus } = require('../controllers/recordingController');
const authMiddleware = require('../middlewares/authMiddleware.js');

/**
 * Applique le middleware d'authentification à toutes les routes
 */
router.use(authMiddleware);

/**
 * Route POST pour démarrer un enregistrement vidéo
 * @name POST/record
 * @function
 * @memberof module:recordingRoutes
 * @param {string} path - Chemin de la route (/record)
 * @param {Function} middleware - Contrôleur pour démarrer l'enregistrement
 */
router.post('/record', startRecording);

/**
 * Route POST pour arrêter un enregistrement vidéo en cours
 * @name POST/stop-record
 * @function
 * @memberof module:recordingRoutes
 * @param {string} path - Chemin de la route (/stop-record)
 * @param {Function} middleware - Contrôleur pour arrêter l'enregistrement
 */
router.post('/stop-record', stopRecording);

/**
 * Route GET pour obtenir le statut de l'enregistrement actuel
 * @name GET/record-status
 * @function
 * @memberof module:recordingRoutes
 * @param {string} path - Chemin de la route (/record-status)
 * @param {Function} middleware - Contrôleur pour obtenir le statut
 */
router.get('/record-status', getRecordingStatus);

/**
 * Export du routeur configuré
 * @type {Object}
 * @property {express.Router} route - Instance du routeur Express configuré
 */
module.exports = { route: router };