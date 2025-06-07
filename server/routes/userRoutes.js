/**
 * @fileoverview Routes Express pour la gestion des utilisateurs
 * Ce module définit toutes les routes HTTP pour les opérations sur les utilisateurs,
 * incluant la gestion des profils, l'authentification 2FA, et les opérations administratives.
 * Toutes les routes nécessitent une authentification via middleware.
 * @module routes/userRoutes
 * @requires express
 * @requires ../controllers/userController
 * @requires ../middlewares/authMiddleware
 */
const express = require('express');

const {
  getAllUsers,
  getUserById,
  updateUserById,
  changeStatus,
  get2FAStatus,
  disable2FA,
  deleteUserById,
  changePassword,
  getProfile,
  updateProfile,
  deleteProfile,
  retrogradeUser,
  upgradeUser
} = require('../controllers/userController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

/**
 * Routeur Express pour les routes utilisateur
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Middleware d'authentification appliqué à toutes les routes
 * Vérifie que l'utilisateur est authentifié avant d'accéder aux routes
 */
router.use(authMiddleware);

/**
 * Route GET pour récupérer tous les utilisateurs
 * @name GET/users
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/"
 * @param {Function} handler - Contrôleur getAllUsers
 */
router.get('/', getAllUsers);

/**
 * Route GET pour récupérer le profil de l'utilisateur authentifié
 * @name GET/users/profile
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/profile"
 * @param {Function} handler - Contrôleur getProfile
 */
router.get('/profile', getProfile);

/**
 * Route GET pour récupérer le statut de l'authentification 2FA
 * @name GET/users/2fa
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/2fa"
 * @param {Function} handler - Contrôleur get2FAStatus
 */
router.get('/2fa', get2FAStatus);

/**
 * Route GET pour récupérer un utilisateur par son ID
 * @name GET/users/:id
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/:id"
 * @param {Function} handler - Contrôleur getUserById
 */
router.get('/:id', getUserById);

/**
 * Route PATCH pour rétrograder le rôle d'un utilisateur
 * @name PATCH/users/retrograde/:id
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/retrograde/:id"
 * @param {Function} handler - Contrôleur retrogradeUser
 */
router.patch('/retrograde/:id', retrogradeUser);

/**
 * Route PATCH pour promouvoir le rôle d'un utilisateur
 * @name PATCH/users/upgrade/:id
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/upgrade/:id"
 * @param {Function} handler - Contrôleur upgradeUser
 */
router.patch('/upgrade/:id', upgradeUser);

/**
 * Route PUT pour mettre à jour le profil de l'utilisateur authentifié
 * @name PUT/users/profile
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/profile"
 * @param {Function} handler - Contrôleur updateProfile
 */
router.put('/profile', updateProfile);

/**
 * Route PATCH pour changer le statut d'un utilisateur (actif/inactif)
 * @name PATCH/users/:id
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/:id"
 * @param {Function} handler - Contrôleur changeStatus
 */
router.patch('/:id', changeStatus);

/**
 * Route PUT pour changer le mot de passe de l'utilisateur authentifié
 * @name PUT/users/change-password
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/change-password"
 * @param {Function} handler - Contrôleur changePassword
 */
router.put('/change-password', changePassword);

/**
 * Route PUT pour mettre à jour un utilisateur par son ID
 * @name PUT/users/:id
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/:id"
 * @param {Function} handler - Contrôleur updateUserById
 */
router.put('/:id', updateUserById);

/**
 * Route DELETE pour désactiver l'authentification 2FA
 * @name DELETE/users/2fa
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/2fa"
 * @param {Function} handler - Contrôleur disable2FA
 */
router.delete('/2fa', disable2FA);

/**
 * Route DELETE pour supprimer le profil de l'utilisateur authentifié
 * @name DELETE/users/profile
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/profile"
 * @param {Function} handler - Contrôleur deleteProfile
 */
router.delete('/profile', deleteProfile);

/**
 * Route DELETE pour supprimer un utilisateur par son ID
 * @name DELETE/users/:id
 * @function
 * @memberof module:routes/userRoutes
 * @param {string} path - Chemin de la route "/:id"
 * @param {Function} handler - Contrôleur deleteUserById
 */
router.delete('/:id', deleteUserById);

/**
 * Export du routeur configuré
 * @type {Object}
 * @property {express.Router} route - Le routeur Express configuré
 */
module.exports = { route: router };
