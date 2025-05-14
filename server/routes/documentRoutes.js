const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');
const {
    getBlobDocument,
    uploadDocument,
    deleteDocument
} = require('../controllers/documentController.js');


const router = express.Router();

router.use(authMiddleware);

// Get a document
router.get('/:id', getBlobDocument);

// Upload a document
router.post('/:id', uploadDocument);

// Delete a document
router.delete('/:id', deleteDocument);

module.exports = { route: router };
