import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import documentController from '../controllers/documentController.js';


const router = express.Router();

// Get a document
router.get('/:id', authMiddleware, documentController.getdocument);

// Download a document
router.get('/download/:id', authMiddleware, documentController.getblobdocument);

export default router;

