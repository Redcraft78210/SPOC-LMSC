/**
 * @fileoverview Routes pour la gestion de la modération de la plateforme.
 * Définit les endpoints pour les avertissements, signalements et leur résolution.
 * Toutes les routes nécessitent une authentification.
 * @module routes/moderationRoutes
 */

const express = require('express');
const router = express.Router();
const { 
  sendWarning, 
  flagContent, 
  getFlags, 
  resolveFlag, 
  getUserWarnings 
} = require('../controllers/moderationController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Applique le middleware d'authentification à toutes les routes de modération
 */
router.use(authMiddleware);

/**
 * Route pour envoyer un avertissement à un utilisateur
 * @name POST /warnings
 * @function
 * @memberof module:routes/moderationRoutes
 * @param {string} path - Chemin de la route
 * @param {function} middleware - Contrôleur pour l'envoi d'avertissements
 */
router.post('/warnings', sendWarning);

/**
 * Route pour récupérer les avertissements d'un utilisateur spécifique
 * @name GET /warnings/user/:userId
 * @function
 * @memberof module:routes/moderationRoutes
 * @param {string} path - Chemin de la route avec paramètre userId
 * @param {function} middleware - Contrôleur pour la récupération des avertissements utilisateur
 */
router.get('/warnings/user/:userId', getUserWarnings);

/**
 * Route pour signaler du contenu problématique
 * @name POST /flags
 * @function
 * @memberof module:routes/moderationRoutes
 * @param {string} path - Chemin de la route
 * @param {function} middleware - Contrôleur pour le signalement de contenu
 */
router.post('/flags', flagContent);

/**
 * Route pour récupérer tous les signalements
 * @name GET /flags
 * @function
 * @memberof module:routes/moderationRoutes
 * @param {string} path - Chemin de la route
 * @param {function} middleware - Contrôleur pour la récupération des signalements
 */
router.get('/flags', getFlags);

/**
 * Route pour résoudre un signalement spécifique
 * @name PUT /flags/:id/resolve
 * @function
 * @memberof module:routes/moderationRoutes
 * @param {string} path - Chemin de la route avec paramètre id
 * @param {function} middleware - Contrôleur pour la résolution de signalement
 */
router.put('/flags/:id/resolve', resolveFlag);

/**
 * Exporte le routeur de modération
 * @type {Object}
 * @property {express.Router} route - Le routeur Express configuré
 */
module.exports = { route: router };