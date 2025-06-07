/**
 * @fileoverview Routes de gestion des messages pour l'application SPOC-LMSC
 * Définit toutes les routes liées aux messages : consultation, envoi, suppression,
 * restauration, téléchargement des pièces jointes et traitement des messages de contact.
 * @module routes/messageRoutes
 * @requires express
 * @requires controllers/messageController
 * @requires middlewares/authMiddleware
 * @requires multer
 */
const express = require('express');
const router = express.Router();
const { getInboxMessages,
  getSentMessages,
  getTrashMessages,
  getMessage,
  sendMessage,
  markMessageAsRead,
  deleteMessage: moveToTrash,
  permanentlyDeleteMessage,
  restoreMessage: restoreFromTrash,
  downloadAttachment,
  createContactMessage } = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

/**
 * Configuration Multer pour le téléchargement de fichiers
 * Utilise la mémoire comme stockage temporaire avec limitations de taille et nombre
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024, // 1GB max file size
    files: 5 // Max 5 files per request
  }
});

/**
 * Route POST /contact
 * Crée un message de contact avec pièces jointes pour les administrateurs
 * @name POST/contact
 * @param {string} req.body.name - Nom de l'expéditeur
 * @param {string} req.body.email - Email de l'expéditeur
 * @param {string} req.body.objet - Objet du message
 * @param {string} req.body.message - Contenu du message
 * @param {string} [req.body.motif] - Motif du contact
 * @param {Array<File>} [req.files] - Pièces jointes (max 5)
 * @returns {Object} Confirmation d'envoi avec ID du message
 */
router.post('/contact', upload.array('attachments', 5), createContactMessage);

/**
 * Route POST /contact/no-attachments
 * Crée un message de contact sans pièces jointes pour les administrateurs
 * @name POST/contact/no-attachments
 * @param {string} req.body.name - Nom de l'expéditeur
 * @param {string} req.body.email - Email de l'expéditeur
 * @param {string} req.body.objet - Objet du message
 * @param {string} req.body.message - Contenu du message
 * @param {string} [req.body.motif] - Motif du contact
 * @returns {Object} Confirmation d'envoi avec ID du message
 */
router.post('/contact/no-attachments', createContactMessage);

/**
 * Middleware d'authentification appliqué à toutes les routes suivantes
 * Vérifie la validité du token JWT et charge les informations utilisateur
 */
router.use(authMiddleware);

/**
 * Route GET /inbox
 * Récupère les messages de la boîte de réception avec pagination et filtres
 * @name GET/inbox
 * @param {number} [req.query.page=1] - Numéro de page
 * @param {string} [req.query.unread] - Filtre messages non lus ('true'/'false')
 * @param {string} [req.query.hasAttachments] - Filtre messages avec pièces jointes ('true'/'false')
 * @param {string} [req.query.fromContact] - Filtre messages du formulaire de contact ('true'/'false')
 * @returns {Object} Messages paginés avec métadonnées
 */
router.get('/inbox', getInboxMessages);

/**
 * Route GET /sent
 * Récupère les messages envoyés par l'utilisateur avec pagination
 * @name GET/sent
 * @param {number} [req.query.page=1] - Numéro de page
 * @param {string} [req.query.hasAttachments] - Filtre messages avec pièces jointes ('true'/'false')
 * @returns {Object} Messages envoyés paginés avec métadonnées
 */
router.get('/sent', getSentMessages);

/**
 * Route GET /trash
 * Récupère les messages dans la corbeille avec pagination
 * @name GET/trash
 * @param {number} [req.query.page=1] - Numéro de page
 * @returns {Object} Messages en corbeille paginés avec métadonnées
 */
router.get('/trash', getTrashMessages);

/**
 * Route GET /:messageId
 * Récupère un message spécifique avec tous ses détails
 * @name GET/:messageId
 * @param {string} req.params.messageId - ID du message
 * @returns {Object} Message complet avec pièces jointes et destinataires
 */
router.get('/:messageId', getMessage);

/**
 * Route POST /
 * Envoie un nouveau message avec pièces jointes
 * @name POST/
 * @param {string} req.body.subject - Sujet du message
 * @param {string} req.body.content - Contenu du message
 * @param {string} req.body.recipientType - Type de destinataires ('individual', 'multiple', 'all-admins', 'all-students', 'all-teachers')
 * @param {Array<number>} [req.body.recipients] - IDs des destinataires (requis pour 'individual' et 'multiple')
 * @param {Array<File>} [req.files] - Pièces jointes (max 5)
 * @returns {Object} Confirmation d'envoi avec ID du message
 */
router.post('/', upload.array('attachments', 5), sendMessage);

/**
 * Route POST /no-attachments
 * Envoie un nouveau message sans pièces jointes
 * @name POST/no-attachments
 * @param {string} req.body.subject - Sujet du message
 * @param {string} req.body.content - Contenu du message
 * @param {string} req.body.recipientType - Type de destinataires
 * @param {Array<number>} [req.body.recipients] - IDs des destinataires
 * @returns {Object} Confirmation d'envoi avec ID du message
 */
router.post('/no-attachments', sendMessage);

/**
 * Route PATCH /:messageId/trash
 * Déplace un message vers la corbeille
 * @name PATCH/:messageId/trash
 * @param {string} req.params.messageId - ID du message
 * @returns {Object} Confirmation de suppression
 */
router.patch('/:messageId/trash', moveToTrash);

/**
 * Route PATCH /:messageId/restore
 * Restaure un message depuis la corbeille
 * @name PATCH/:messageId/restore
 * @param {string} req.params.messageId - ID du message
 * @returns {Object} Confirmation de restauration
 */
router.patch('/:messageId/restore', restoreFromTrash);

/**
 * Route PATCH /:messageId/read
 * Marque un message comme lu
 * @name PATCH/:messageId/read
 * @param {string} req.params.messageId - ID du message
 * @returns {Object} Confirmation de lecture
 */
router.patch('/:messageId/read', markMessageAsRead);

/**
 * Route DELETE /:messageId
 * Supprime définitivement un message de la corbeille
 * @name DELETE/:messageId
 * @param {string} req.params.messageId - ID du message
 * @returns {Object} Confirmation de suppression définitive
 */
router.delete('/:messageId', permanentlyDeleteMessage);

/**
 * Route GET /attachments/:attachmentId
 * Télécharge une pièce jointe
 * @name GET/attachments/:attachmentId
 * @param {string} req.params.attachmentId - ID de la pièce jointe
 * @returns {Stream} Fichier en streaming
 */
router.get('/attachments/:attachmentId', downloadAttachment);

module.exports = { route: router };
