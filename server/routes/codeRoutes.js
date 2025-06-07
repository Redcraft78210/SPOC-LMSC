/**
 * @fileoverview Définition des routes pour la gestion des codes d'accès.
 * Ce module configure les routes Express pour les opérations CRUD sur les codes d'accès
 * avec authentification requise pour tous les endpoints.
 */
const express = require('express');
const { getAllCodes, createCode, deleteCode } = require('../controllers/codeController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Applique le middleware d'authentification à toutes les routes de ce routeur.
 * Toutes les requêtes doivent être authentifiées pour accéder aux endpoints des codes.
 */
router.use(authMiddleware)

/**
 * Route GET pour récupérer tous les codes d'accès.
 * @route GET /
 * @access Private - Authentification requise
 */
router.get('/', getAllCodes);

/**
 * Route POST pour créer un nouveau code d'accès.
 * @route POST /
 * @access Private - Authentification requise
 */
router.post('/', createCode);

/**
 * Route DELETE pour supprimer un code d'accès spécifique.
 * @route DELETE /:code
 * @param {string} code - La valeur du code à supprimer
 * @access Private - Authentification requise
 */
router.delete('/:code', deleteCode);

/**
 * Exporte le routeur configuré.
 * @type {Object}
 * @property {express.Router} route - Le routeur Express configuré avec toutes les routes des codes
 */
module.exports = { route: router };