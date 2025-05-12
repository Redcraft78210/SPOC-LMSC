const express = require('express');
const router = express.Router();
const { getMessages, postMessage, deleteMessage, deleteUserMessages, deleteLiveMessages, deleteUserLiveMessages } = require('../controllers/chatController.js');
const authMiddleware = require('../middlewares/authMiddleware');

// Récupérer les messages d'un live
router.get('/:liveId/chat', authMiddleware, getMessages);

// Envoyer un message
router.post('/:liveId/chat', authMiddleware, postMessage);

// Supprimer un message
router.delete('/:liveId/chat/:messageId', authMiddleware, deleteMessage);

// Supprimer tous les messages d'un utilisateur
router.delete('/:liveId/chat/user/:userId', authMiddleware, deleteUserMessages);

// Supprimer tous les messages d'un live
router.delete('/:liveId/chat/live/:liveId', authMiddleware, deleteLiveMessages);

// Supprimer tous les messages d'un utilisateur dans un live
router.delete('/:liveId/chat/user/:userId/live/:liveId', authMiddleware, deleteUserLiveMessages);

module.exports = router;