const express = require('express');
const { getThreads, createThread, getThreadDetails, addComment } = require('../controllers/forumController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.use(authMiddleware);

// GET /api/forum/threads - Liste des discussions
router.get('/threads', getThreads);

// POST /api/forum/threads - Créer une discussion
router.post('/threads', createThread);

// GET /api/forum/threads/:threadId - Détail d'une discussion avec commentaires
router.get('/threads/:threadId', getThreadDetails);

// POST /api/forum/threads/:threadId/comments - Ajouter un commentaire
router.post('/threads/:threadId/comments', addComment);

module.exports = { route: router };