/**
 * @fileoverview Routes de gestion des documents PDF pour l'application SPOC-LMSC.
 * Ce module définit les routes Express pour le téléchargement, la récupération et la suppression
 * des documents PDF avec authentification requise.
 * 
 * @module documentRoutes
 * @requires express
 * @requires ../middlewares/authMiddleware
 * @requires ../controllers/documentController
 */

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');
const {
    getBlobDocument,
    uploadDocument,
    deleteDocument
} = require('../controllers/documentController.js');

/**
 * Router Express pour les routes de documents
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Middleware d'authentification appliqué à toutes les routes de documents
 */
router.use(authMiddleware);

/**
 * Route pour récupérer un document PDF par son ID
 * @name GET /documents/:id
 * @function
 * @memberof module:documentRoutes
 * @param {string} id - Identifiant unique du document
 * @returns {Buffer} Document PDF avec en-têtes de sécurité appropriés
 * @throws {400} ID de document invalide
 * @throws {404} Document non trouvé
 * @throws {500} Erreur interne du serveur
 */
router.get('/:id', getBlobDocument);

/**
 * Route pour télécharger ou mettre à jour un document PDF
 * @name POST /documents/:id
 * @function
 * @memberof module:documentRoutes
 * @param {string} id - Identifiant unique du document
 * @param {Buffer} body - Données binaires du document PDF
 * @param {string} [body.courseId] - ID du cours associé
 * @param {boolean} [body.isMain] - Si le document est principal pour le cours
 * @param {string} [body.title] - Titre du document
 * @param {string} [body.description] - Description du document
 * @param {string} [body.fingerprint] - Empreinte unique du document
 * @returns {Object} Confirmation du téléchargement avec métadonnées
 * @throws {400} ID invalide ou données manquantes
 * @throws {403} Accès non autorisé
 * @throws {500} Erreur interne du serveur
 */
router.post('/:id', uploadDocument);

/**
 * Route pour supprimer un document PDF
 * @name DELETE /documents/:id
 * @function
 * @memberof module:documentRoutes
 * @param {string} id - Identifiant unique du document à supprimer
 * @returns {Object} Confirmation de la suppression
 * @throws {400} ID de document invalide
 * @throws {403} Accès non autorisé
 * @throws {404} Document non trouvé
 * @throws {500} Erreur interne du serveur
 */
router.delete('/:id', deleteDocument);

/**
 * Exporte le router configuré
 * @type {Object}
 * @property {express.Router} route - Router Express configuré avec les routes de documents
 */
module.exports = { route: router };
