const express = require('express');
const router = express.Router();
const { getMessages, postMessage, deleteMessage, deleteUserMessages, deleteLiveMessages, deleteUserLiveMessages } = require('../controllers/chatController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware);

// Récupérer les messages d'un live
router.get('/:liveId/chat', getMessages);

// Envoyer un message
router.post('/:liveId/chat', postMessage);

// Supprimer un message
router.delete('/:liveId/chat/:messageId', deleteMessage);

// Supprimer tous les messages d'un utilisateur
router.delete('/:liveId/chat/user/:userId', deleteUserMessages);

// Supprimer tous les messages d'un live
router.delete('/:liveId/chat/live/:liveId', deleteLiveMessages);

// Supprimer tous les messages d'un utilisateur dans un live
router.delete('/:liveId/chat/user/:userId/live/:liveId', deleteUserLiveMessages);

module.exports = { route: router };