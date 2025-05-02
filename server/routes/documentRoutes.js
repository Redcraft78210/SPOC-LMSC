import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getDocument, getBlobDocument } from '../controllers/documentController.js';


const router = express.Router();

// Get a document
router.get('/:id', authMiddleware, getDocument);

// Download a document
router.get('/download/:id', authMiddleware, getBlobDocument);

export default router;

