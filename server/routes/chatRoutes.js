/**
 * @fileoverview Définition des routes API REST pour la gestion du chat en temps réel.
 * Ce module configure les endpoints pour les opérations CRUD sur les messages de chat,
 * avec authentification requise pour tous les endpoints.
 * @module chatRoutes
 */

const express = require('express');
const router = express.Router();
const { getMessages, postMessage, deleteMessage, deleteUserMessages, deleteLiveMessages, deleteUserLiveMessages } = require('../controllers/chatController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

/**
 * Applique le middleware d'authentification à toutes les routes du chat
 */
router.use(authMiddleware);

/**
 * Route pour récupérer tous les messages d'un live
 * @route GET /:liveId/chat
 * @param {string} liveId - ID du live dont on veut récupérer les messages
 * @returns {Object} Liste des messages avec informations utilisateurs
 */
router.get('/:liveId/chat', getMessages);

/**
 * Route pour publier un nouveau message dans un live
 * @route POST /:liveId/chat
 * @param {string} liveId - ID du live où publier le message
 * @body {Object} body - Corps de la requête contenant le message
 * @returns {Object} Message créé avec informations utilisateur
 */
router.post('/:liveId/chat', postMessage);

/**
 * Route pour supprimer un message spécifique
 * @route DELETE /:liveId/chat/:messageId
 * @param {string} liveId - ID du live contenant le message
 * @param {string} messageId - ID du message à supprimer
 * @returns {undefined} Statut 204 en cas de succès
 */
router.delete('/:liveId/chat/:messageId', deleteMessage);

/**
 * Route pour supprimer tous les messages d'un utilisateur
 * @route DELETE /:liveId/chat/user/:userId
 * @param {string} liveId - ID du live
 * @param {string} userId - ID de l'utilisateur dont on veut supprimer les messages
 * @returns {undefined} Statut 204 en cas de succès
 */
router.delete('/:liveId/chat/user/:userId', deleteUserMessages);

/**
 * Route pour supprimer tous les messages d'un live
 * @route DELETE /:liveId/chat/live/:liveId
 * @param {string} liveId - ID du live dont on veut supprimer les messages
 * @returns {undefined} Statut 204 en cas de succès
 */
router.delete('/:liveId/chat/live/:liveId', deleteLiveMessages);

/**
 * Route pour supprimer tous les messages d'un utilisateur dans un live spécifique
 * @route DELETE /:liveId/chat/user/:userId/live/:liveId
 * @param {string} liveId - ID du live concerné
 * @param {string} userId - ID de l'utilisateur dont on veut supprimer les messages
 * @returns {undefined} Statut 204 en cas de succès
 */
router.delete('/:liveId/chat/user/:userId/live/:liveId', deleteUserLiveMessages);

/**
 * Exporte le routeur configuré pour les routes de chat
 * @type {Object}
 * @property {express.Router} route - Instance du routeur Express configuré
 */
module.exports = { route: router };