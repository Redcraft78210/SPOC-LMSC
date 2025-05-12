import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
    getDocument,
    getBlobDocument,
    uploadDocument,
    deleteDocument
} from '../controllers/documentController.js';


const router = express.Router();

// Get a document
router.get('/:id', authMiddleware, getDocument);

// Download a document
router.get('/download/:id', authMiddleware, getBlobDocument);

// Upload a document
router.post('/:id', authMiddleware, uploadDocument);

// Delete a document
router.delete('/:id', authMiddleware, deleteDocument);

export default router;

