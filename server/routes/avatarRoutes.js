const express = require('express');
const router = express.Router();
const { uploadAvatar, getAvatar, getMyAvatar, deleteAvatar, deleteUserAvatar } = require('../controllers/avatarController');
const authMiddleware = require('../middlewares/authMiddleware.js');
const multer = require('multer');

// Configuration de Multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Route pour uploader un avatar (utilisateur connecté)
router.post('/', authMiddleware, upload.single('avatar'), uploadAvatar);

// Route pour récupérer son propre avatar
router.get('/', authMiddleware, getMyAvatar);

// Route pour récupérer l'avatar d'un utilisateur spécifique
router.get('/:userId', getAvatar);

// Route pour supprimer son propre avatar
router.delete('/', authMiddleware, deleteAvatar);

// Route pour supprimer l'avatar d'un utilisateur spécifique (admin)
router.delete('/:userId', authMiddleware, deleteUserAvatar);

module.exports = router;