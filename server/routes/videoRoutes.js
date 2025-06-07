/**
 * @fileoverview Routes pour la gestion des vidéos avec contrôle d'accès par referrer.
 * Définit les endpoints pour l'accès aux vidéos, leur upload, téléchargement et suppression.
 * @module videoRoutes
 */

const express = require('express');
const { getVideo, getVideoInfo, uploadVideo, downloadVideo, deleteVideo } = require('../controllers/videoController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Liste des préfixes de referrer autorisés pour l'accès aux vidéos
 * @constant {string[]}
 */
const allowedReferrerStarts = ['https://spoc.lmsc'];

/**
 * Middleware de validation du referrer pour sécuriser l'accès aux vidéos
 * @param {Object} req - L'objet requête Express
 * @param {Object} res - L'objet réponse Express  
 * @param {Function} next - Fonction de passage au middleware suivant
 * @returns {Object} Réponse 403 si le referrer n'est pas autorisé
 */
const validateReferrer = (req, res, next) => {
  const referrer = req.get('Referrer');
  if (!referrer || !allowedReferrerStarts.some(start => referrer.startsWith(start))) {
    return res.status(403).send('Forbidden');
  }
  next();
};

/**
 * Route GET pour récupérer et diffuser une vidéo par streaming
 * @name GET/video/:id
 * @param {string} id - Identifiant unique de la vidéo
 * @requires Referrer valide
 */
router.get('/:id', validateReferrer, getVideo);

/**
 * Route GET pour récupérer les informations d'une vidéo
 * @name GET/video/info/:id
 * @param {string} id - Identifiant unique de la vidéo
 * @requires Referrer valide
 */
router.get('/info/:id', validateReferrer, getVideoInfo);

/**
 * Application du middleware d'authentification pour toutes les routes suivantes
 */
router.use(authMiddleware);

/**
 * Route POST pour uploader une nouvelle vidéo
 * @name POST/video/
 * @requires Authentification
 */
router.post('/', uploadVideo);

/**
 * Route GET pour télécharger une vidéo complète
 * @name GET/video/download/:id
 * @param {string} id - Identifiant unique de la vidéo
 * @requires Authentification
 */
router.get('/download/:id', downloadVideo);

/**
 * Route DELETE pour supprimer une vidéo
 * @name DELETE/video/:id
 * @param {string} id - Identifiant unique de la vidéo
 * @requires Authentification
 */
router.delete('/:id', deleteVideo);

module.exports = { route: router };
