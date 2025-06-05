const { Warning, Flag, User, Thread, Comment } = require('../models');

/**
 * Envoyer un avertissement à un utilisateur
 */
const sendWarning = async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    // Vérifier que l'expéditeur est un administrateur
    if (req.user.role !== 'Administrateur') {
      return res.status(403).json({ message: 'Accès non autorisé. Seuls les administrateurs peuvent envoyer des avertissements.' });
    }
    
    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Créer l'avertissement
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
 * Signaler un contenu (thread ou commentaire)
 */
const flagContent = async (req, res) => {
  try {
    const { itemId, itemType, reason } = req.body;
    
    // Vérifier que le type d'élément est valide
    if (!['thread', 'comment'].includes(itemType)) {
      return res.status(400).json({ message: 'Type d\'élément invalide. Doit être "thread" ou "comment".' });
    }
    
    // Vérifier que l'élément existe
    let item;
    if (itemType === 'thread') {
      item = await Thread.findByPk(itemId);
    } else {
      item = await Comment.findByPk(itemId);
    }
    
    if (!item) {
      return res.status(404).json({ message: `${itemType === 'thread' ? 'Discussion' : 'Commentaire'} non trouvé` });
    }
    
    // Vérifier si un signalement existe déjà pour cet élément par cet utilisateur
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
    
    // Créer le signalement
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
 * Récupérer tous les signalements (admin seulement)
 */
const getFlags = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un administrateur
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
 * Résoudre un signalement (admin seulement)
 */
const resolveFlag = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur est un administrateur
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
 * Récupérer les avertissements d'un utilisateur
 */
const getUserWarnings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier si l'utilisateur actuel a le droit de voir ces avertissements
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