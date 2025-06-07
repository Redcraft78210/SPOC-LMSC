/**
 * @fileoverview Routes pour la gestion des avatars utilisateurs.
 * Définit les endpoints REST pour télécharger, récupérer et supprimer des avatars.
 * 
 * @module routes/avatarRoutes
 * @requires express
 * @requires multer
 * @requires ../controllers/avatarController
 * @requires ../middlewares/authMiddleware
 */

const express = require('express');
const router = express.Router();
const { uploadAvatar, getAvatar, getMyAvatar, deleteAvatar, deleteUserAvatar } = require('../controllers/avatarController');
const authMiddleware = require('../middlewares/authMiddleware.js');
const multer = require('multer');

/**
 * Configuration du stockage multer en mémoire
 * @constant {multer.StorageEngine}
 */
const storage = multer.memoryStorage();

/**
 * Configuration multer pour l'upload d'avatars
 * @constant {multer.Multer}
 */
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/**
 * Middleware d'authentification appliqué à toutes les routes
 */
router.use(authMiddleware);

/**
 * Route POST pour télécharger un avatar
 * @name POST /
 * @function
 * @memberof module:routes/avatarRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} middleware - Middleware multer pour traiter le fichier
 * @param {Function} handler - Contrôleur uploadAvatar
 */
router.post('/', upload.single('avatar'), uploadAvatar);

/**
 * Route GET pour récupérer l'avatar de l'utilisateur connecté
 * @name GET /
 * @function
 * @memberof module:routes/avatarRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} handler - Contrôleur getMyAvatar
 */
router.get('/', getMyAvatar);

/**
 * Route GET pour récupérer l'avatar d'un utilisateur spécifique
 * @name GET /:userId
 * @function
 * @memberof module:routes/avatarRoutes
 * @param {string} path - Chemin de la route avec paramètre userId
 * @param {Function} handler - Contrôleur getAvatar
 */
router.get('/:userId', getAvatar);

/**
 * Route DELETE pour supprimer l'avatar de l'utilisateur connecté
 * @name DELETE /
 * @function
 * @memberof module:routes/avatarRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} handler - Contrôleur deleteAvatar
 */
router.delete('/', deleteAvatar);

/**
 * Route DELETE pour supprimer l'avatar d'un utilisateur spécifique
 * @name DELETE /:userId
 * @function
 * @memberof module:routes/avatarRoutes
 * @param {string} path - Chemin de la route avec paramètre userId
 * @param {Function} handler - Contrôleur deleteUserAvatar
 */
router.delete('/:userId', deleteUserAvatar);

/**
 * Exporte le routeur configuré
 * @type {Object}
 * @property {express.Router} route - Routeur Express configuré
 */
module.exports = { route: router };