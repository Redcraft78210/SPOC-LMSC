/**
 * @fileoverview Routes d'authentification pour l'application SPOC-LMSC.
 * Définit les endpoints pour l'inscription, la connexion et l'authentification à deux facteurs.
 * @module routes/authRoutes
 */

const express = require('express');
const validateUser = require('../middlewares/userValidation.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const { checkRegisterCode, register, manualRegister, firstLogin, login, activate2FA, verify2FA, refresh2FASetup } = require('../controllers/authController.js');

const router = express.Router();

/**
 * Route pour vérifier la validité d'un code d'enregistrement
 * @name POST /check-register-code
 * @function
 * @memberof module:routes/authRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} handler - Gestionnaire de la route
 */
router.post('/check-register-code', checkRegisterCode);

/**
 * Route pour l'inscription d'un nouvel utilisateur avec validation
 * @name POST /register
 * @function
 * @memberof module:routes/authRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} middleware - Middleware de validation utilisateur
 * @param {Function} handler - Gestionnaire de la route
 */
router.post('/register', validateUser, register);

/**
 * Route pour l'inscription manuelle d'un utilisateur (administrateur)
 * @name POST /manual-register
 * @function
 * @memberof module:routes/authRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} middleware - Middleware de validation utilisateur
 * @param {Function} handler - Gestionnaire de la route
 */
router.post('/manual-register', validateUser, manualRegister);

/**
 * Route pour la première connexion d'un utilisateur
 * @name POST /first-login
 * @function
 * @memberof module:routes/authRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} middleware - Middleware d'authentification
 * @param {Function} handler - Gestionnaire de la route
 */
router.post('/first-login', authMiddleware, firstLogin);

/**
 * Route pour la connexion d'un utilisateur
 * @name POST /login
 * @function
 * @memberof module:routes/authRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} handler - Gestionnaire de la route
 */
router.post('/login', login);

/**
 * Route pour activer l'authentification à deux facteurs
 * @name POST /activate-2fa
 * @function
 * @memberof module:routes/authRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} middleware - Middleware d'authentification
 * @param {Function} handler - Gestionnaire de la route
 */
router.post('/activate-2fa', authMiddleware, activate2FA);

/**
 * Route pour vérifier un code d'authentification à deux facteurs
 * @name POST /verify-2fa
 * @function
 * @memberof module:routes/authRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} handler - Gestionnaire de la route
 */
router.post('/verify-2fa', verify2FA);

/**
 * Route pour rafraîchir la configuration 2FA
 * @name POST /refresh-2fa-setup
 * @function
 * @memberof module:routes/authRoutes
 * @param {string} path - Chemin de la route
 * @param {Function} handler - Gestionnaire de la route
 */
router.post('/refresh-2fa-setup', refresh2FASetup);

module.exports = { route: router };