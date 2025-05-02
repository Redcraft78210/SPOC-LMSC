import express from 'express';
import { getThreads, createThread, getThreadDetails, addComment } from '../controllers/forumController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/forum/threads - Liste des discussions
router.get('/threads', authMiddleware, getThreads);

// POST /api/forum/threads - Créer une discussion
router.post('/threads', authMiddleware, createThread);

// GET /api/forum/threads/:threadId - Détail d'une discussion avec commentaires
router.get('/threads/:threadId', authMiddleware, getThreadDetails);

// POST /api/forum/threads/:threadId/comments - Ajouter un commentaire
router.post('/threads/:threadId/comments', authMiddleware, addComment);

export default router;
