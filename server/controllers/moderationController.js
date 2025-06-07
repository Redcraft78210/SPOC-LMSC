/**
 * @fileoverview Contrôleur pour la gestion de la modération de la plateforme.
 * Gère les avertissements aux utilisateurs, les signalements de contenu et 
 * leur résolution par les administrateurs.
 * @module controllers/moderationController
 */
const { Warning, Flag, User, Thread, Comment } = require('../models');

/**
 * Envoie un avertissement à un utilisateur
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.userId - L'identifiant de l'utilisateur à avertir
 * @param {string} req.body.message - Le message d'avertissement
 * @param {Object} req.user - L'utilisateur qui fait la requête (administrateur)
 * @param {string} req.user.id - L'identifiant de l'administrateur
 * @param {string} req.user.role - Le rôle de l'utilisateur
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Réponse JSON avec message de confirmation et données de l'avertissement
 * @throws {Error} Erreur serveur lors de l'envoi de l'avertissement
 * 
 * @example
 * // Envoi d'un avertissement
 * POST /api/moderation/warnings
 * {
 *   "userId": "123",
 *   "message": "Comportement inapproprié dans le forum"
 * }
 */
const sendWarning = async (req, res) => {
  try {
    const { userId, message } = req.body;
    

    if (req.user.role !== 'Administrateur') {
      return res.status(403).json({ message: 'Accès non autorisé. Seuls les administrateurs peuvent envoyer des avertissements.' });
    }
    

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    

    const warning = await Warning.create({
      userId,
      adminId: req.user.id,
      message
    });
    
    return res.status(201).json({
      message: 'Avertissement envoyé avec succès',
      warning
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'avertissement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'envoi de l\'avertissement' });
  }
};

/**
 * Signale un contenu problématique (thread ou commentaire)
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.itemId - L'identifiant de l'élément à signaler
 * @param {string} req.body.itemType - Le type d'élément ("thread" ou "comment")
 * @param {string} req.body.reason - La raison du signalement
 * @param {Object} req.user - L'utilisateur qui fait le signalement
 * @param {string} req.user.id - L'identifiant de l'utilisateur
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Réponse JSON avec message de confirmation et données du signalement
 * @throws {Error} Erreur serveur lors du signalement du contenu
 * 
 * @example
 * // Signaler un commentaire
 * POST /api/moderation/flags
 * {
 *   "itemId": "456",
 *   "itemType": "comment",
 *   "reason": "Contenu offensant"
 * }
 */
const flagContent = async (req, res) => {
  try {
    const { itemId, itemType, reason } = req.body;
    

    if (!['thread', 'comment'].includes(itemType)) {
      return res.status(400).json({ message: 'Type d\'élément invalide. Doit être "thread" ou "comment".' });
    }
    

    let item;
    if (itemType === 'thread') {
      item = await Thread.findByPk(itemId);
    } else {
      item = await Comment.findByPk(itemId);
    }
    
    if (!item) {
      return res.status(404).json({ message: `${itemType === 'thread' ? 'Discussion' : 'Commentaire'} non trouvé` });
    }
    

    const existingFlag = await Flag.findOne({
      where: {
        itemId,
        itemType,
        reportedBy: req.user.id,
        status: { [sequelize.Op.ne]: 'resolved' }
      }
    });
    
    if (existingFlag) {
      return res.status(400).json({ message: 'Vous avez déjà signalé ce contenu' });
    }
    

    const flag = await Flag.create({
      itemId,
      itemType,
      reason,
      reportedBy: req.user.id
    });
    
    return res.status(201).json({
      message: 'Contenu signalé avec succès',
      flag
    });
  } catch (error) {
    console.error('Erreur lors du signalement du contenu:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du signalement du contenu' });
  }
};

/**
 * Récupère tous les signalements (réservé aux administrateurs)
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.query - Paramètres de requête
 * @param {string} [req.query.status="pending"] - Statut des signalements à récupérer
 * @param {Object} req.user - L'utilisateur qui fait la requête
 * @param {string} req.user.role - Le rôle de l'utilisateur
 * @param {Object} res - L'objet réponse Express
 * @returns {Object[]} Liste des signalements avec informations sur les reporters et résolveurs
 * @throws {Error} Erreur serveur lors de la récupération des signalements
 * 
 * @example
 * // Récupérer tous les signalements en attente
 * GET /api/moderation/flags
 * 
 * // Récupérer tous les signalements résolus
 * GET /api/moderation/flags?status=resolved
 */
const getFlags = async (req, res) => {
  try {

    if (req.user.role !== 'Administrateur') {
      return res.status(403).json({ message: 'Accès non autorisé. Seuls les administrateurs peuvent voir les signalements.' });
    }
    
    const { status = 'pending' } = req.query;
    
    const flags = await Flag.findAll({
      where: status !== 'all' ? { status } : {},
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'username', 'name', 'surname'] },
        { model: User, as: 'resolver', attributes: ['id', 'username', 'name', 'surname'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(flags);
  } catch (error) {
    console.error('Erreur lors de la récupération des signalements:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des signalements' });
  }
};

/**
 * Résout un signalement (réservé aux administrateurs)
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Paramètres de route
 * @param {string} req.params.id - L'identifiant du signalement à résoudre
 * @param {Object} req.user - L'utilisateur qui fait la requête
 * @param {string} req.user.id - L'identifiant de l'administrateur
 * @param {string} req.user.role - Le rôle de l'utilisateur
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Réponse JSON avec message de confirmation et données du signalement résolu
 * @throws {Error} Erreur serveur lors de la résolution du signalement
 * 
 * @example
 * // Résoudre un signalement
 * PUT /api/moderation/flags/789/resolve
 */
const resolveFlag = async (req, res) => {
  try {
    const { id } = req.params;
    

    if (req.user.role !== 'Administrateur') {
      return res.status(403).json({ message: 'Accès non autorisé. Seuls les administrateurs peuvent résoudre les signalements.' });
    }
    
    const flag = await Flag.findByPk(id);
    if (!flag) {
      return res.status(404).json({ message: 'Signalement non trouvé' });
    }
    
    flag.status = 'resolved';
    flag.resolvedBy = req.user.id;
    flag.resolvedAt = new Date();
    await flag.save();
    
    return res.status(200).json({
      message: 'Signalement résolu avec succès',
      flag
    });
  } catch (error) {
    console.error('Erreur lors de la résolution du signalement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la résolution du signalement' });
  }
};

/**
 * Récupère les avertissements d'un utilisateur
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Paramètres de route
 * @param {string} req.params.userId - L'identifiant de l'utilisateur
 * @param {Object} req.user - L'utilisateur qui fait la requête
 * @param {string} req.user.id - L'identifiant de l'utilisateur
 * @param {string} req.user.role - Le rôle de l'utilisateur
 * @param {Object} res - L'objet réponse Express
 * @returns {Object[]} Liste des avertissements avec informations sur les administrateurs
 * @throws {Error} Erreur serveur lors de la récupération des avertissements
 * 
 * @example
 * // Récupérer les avertissements d'un utilisateur
 * GET /api/moderation/users/123/warnings
 */
const getUserWarnings = async (req, res) => {
  try {
    const { userId } = req.params;
    

    if (req.user.id !== userId && req.user.role !== 'Administrateur') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const warnings = await Warning.findAll({
      where: { userId },
      include: [
        { model: User, as: 'admin', attributes: ['id', 'username', 'name', 'surname'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(warnings);
  } catch (error) {
    console.error('Erreur lors de la récupération des avertissements:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des avertissements' });
  }
};

module.exports = {
  sendWarning,
  flagContent,
  getFlags,
  resolveFlag,
  getUserWarnings
};