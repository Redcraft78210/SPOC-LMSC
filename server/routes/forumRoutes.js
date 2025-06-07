/**
 * @fileoverview Routes pour les fonctionnalités du forum. Définit les endpoints pour
 * la gestion des threads et commentaires avec authentification requise.
 * @module forumRoutes
 */

const express = require('express');
const { getThreads, createThread, getThreadDetails, addComment } = require('../controllers/forumController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Applique le middleware d'authentification à toutes les routes du forum
 */
router.use(authMiddleware);

/**
 * Route pour récupérer la liste des threads avec pagination et filtres
 * @route GET /threads
 * @param {Object} req.query - Paramètres de requête optionnels
 * @param {number} [req.query.page=1] - Numéro de page
 * @param {number} [req.query.limit=10] - Nombre d'éléments par page
 * @param {string} [req.query.sortBy='newest'] - Critère de tri
 * @param {string} [req.query.search=''] - Terme de recherche
 * @param {string} [req.query.category=''] - Catégorie à filtrer
 * @param {string} [req.query.author=''] - Auteur à filtrer
 * @returns {Object} Liste paginée des threads
 */
router.get('/threads', getThreads);

/**
 * Route pour créer un nouveau thread
 * @route POST /threads
 * @param {Object} req.body - Données du thread
 * @param {string} req.body.title - Titre du thread
 * @param {string} req.body.content - Contenu du thread
 * @returns {Object} Thread créé avec son ID
 */
router.post('/threads', createThread);

/**
 * Route pour récupérer les détails d'un thread spécifique avec ses commentaires
 * @route GET /threads/:threadId
 * @param {string} req.params.threadId - ID du thread
 * @returns {Object} Détails du thread avec ses commentaires
 */
router.get('/threads/:threadId', getThreadDetails);

/**
 * Route pour ajouter un commentaire à un thread
 * @route POST /threads/:threadId/comments
 * @param {string} req.params.threadId - ID du thread
 * @param {Object} req.body - Données du commentaire
 * @param {string} req.body.content - Contenu du commentaire
 * @returns {Object} Commentaire créé avec les informations de l'auteur
 */
router.post('/threads/:threadId/comments', addComment);

module.exports = { route: router };