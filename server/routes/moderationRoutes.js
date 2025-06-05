const express = require('express');
const router = express.Router();
const { 
  sendWarning, 
  flagContent, 
  getFlags, 
  resolveFlag, 
  getUserWarnings 
} = require('../controllers/moderationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protéger toutes les routes avec l'authentification
router.use(authMiddleware);

// Routes pour les avertissements
router.post('/warnings', sendWarning);
router.get('/warnings/user/:userId', getUserWarnings);

// Routes pour les signalements
router.post('/flags', flagContent);
router.get('/flags', getFlags);
router.put('/flags/:id/resolve', resolveFlag);

module.exports = { route: router };