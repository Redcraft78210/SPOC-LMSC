/**
 * @fileoverview Routes pour la gestion des sessions de diffusion en direct (lives).
 * Définit tous les endpoints REST pour les opérations CRUD et de gestion d'état des sessions live.
 * Toutes les routes nécessitent une authentification.
 */

const express = require('express');
const liveValidation = require('../middlewares/liveValidation.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const {
    getLive,
    getAllLives,
    getLiveByClass,
    addLive,
    editLive,
    deleteLive,
    startLive,
    endLive,
    blockLive,
    unblockLive,
    disapproveLive
} = require('../controllers/liveController.js');

const router = express.Router();

// Applique l'authentification à toutes les routes
router.use(authMiddleware);

/**
 * @route GET /all
 * @description Récupère toutes les sessions de diffusion disponibles
 * @access Authentifié
 */
router.get('/all', getAllLives);

/**
 * @route GET /:id
 * @description Récupère une session de diffusion spécifique par son ID
 * @param {string} id - ID de la session
 * @access Authentifié
 */
router.get('/:id', getLive);

/**
 * @route POST /
 * @description Crée une nouvelle session de diffusion
 * @middleware liveValidation - Validation des données de la session
 * @access Authentifié
 */
router.post('/', liveValidation.liveValidationRules(), liveValidation.validate, addLive);

/**
 * @route PUT /:id
 * @description Modifie une session de diffusion existante
 * @param {string} id - ID de la session à modifier
 * @access Authentifié
 */
router.put('/:id', editLive);

/**
 * @route DELETE /:id
 * @description Supprime une session de diffusion
 * @param {string} id - ID de la session à supprimer
 * @access Authentifié
 */
router.delete('/:id', deleteLive);

/**
 * @route GET /class/:classId
 * @description Récupère les sessions de diffusion pour une classe spécifique
 * @param {string} classId - ID de la classe
 * @access Authentifié
 */
router.get('/class/:classId', getLiveByClass);

/**
 * @route PATCH /:id/start
 * @description Démarre une session de diffusion
 * @param {string} id - ID de la session à démarrer
 * @access Authentifié
 */
router.patch('/:id/start', startLive);

/**
 * @route PATCH /:id/end
 * @description Termine une session de diffusion
 * @param {string} id - ID de la session à terminer
 * @access Authentifié
 */
router.patch('/:id/end', endLive);

/**
 * @route PATCH /:id/block
 * @description Bloque une session de diffusion
 * @param {string} id - ID de la session à bloquer
 * @access Authentifié
 */
router.patch('/:id/block', blockLive);

/**
 * @route PATCH /:id/unblock
 * @description Débloque une session de diffusion
 * @param {string} id - ID de la session à débloquer
 * @access Authentifié
 */
router.patch('/:id/unblock', unblockLive);

/**
 * @route PATCH /:id/disapprove
 * @description Désapprouve une session de diffusion avec justification
 * @param {string} id - ID de la session à désapprouver
 * @access Authentifié
 */
router.patch('/:id/disapprove', disapproveLive);

module.exports = { route: router };
