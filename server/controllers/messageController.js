/**
 * @fileoverview Contrôleur de gestion des messages pour l'application SPOC-LMSC
 * Gère toutes les opérations liées aux messages : consultation, envoi, suppression, 
 * restauration, téléchargement des pièces jointes et traitement des messages de contact.
 * @module controllers/messageController
 * @requires models
 * @requires services/virusScanService
 * @requires fs
 * @requires path
 * @requires uuid
 */

/**
 * Construit une clause WHERE pour filtrer les messages selon le rôle de l'utilisateur
 * et les IDs des messages dont il est destinataire.
 * 
 * @param {string} role - Le rôle de l'utilisateur ('Etudiant', 'Professeur', 'Administrateur')
 * @param {Array<number>} recipientMessageIds - IDs des messages où l'utilisateur est destinataire
 * @returns {Object} Une clause WHERE pour Sequelize
 * @private
 */
function buildWhereClause(role, recipientMessageIds) {
  const baseOr = [
    {
      [Op.and]: [
        { id: { [Op.in]: recipientMessageIds } },
        { recipientType: { [Op.in]: ['individual', 'multiple'] } }
      ]
    }
  ];

  const roleRecipientMap = {
    Etudiant: ['all-students'],
    Professeur: ['all-teachers'],
    Administrateur: ['all-admins']
  };

  const extraTypes = roleRecipientMap[role] || [];
  extraTypes.forEach((type) => {
    baseOr.push({
      recipientType: type
    });
  });

  return { [Op.or]: baseOr };
}

/**
 * Récupère les messages de la boîte de réception de l'utilisateur connecté
 * avec pagination et filtres optionnels.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.query - Paramètres de requête
 * @param {number} [req.query.page=1] - Numéro de page pour la pagination
 * @param {string} [req.query.unread] - Filtre pour les messages non lus ('true'/'false')
 * @param {string} [req.query.hasAttachments] - Filtre pour les messages avec pièces jointes ('true'/'false')
 * @param {string} [req.query.fromContact] - Filtre pour les messages du formulaire de contact ('true'/'false')
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Messages paginés avec métadonnées
 * @throws {Error} Si une erreur se produit lors de la récupération des messages
 */
const getInboxMessages = async (req, res) => {
  try {
    const { page = 1, unread, hasAttachments, fromContact } = req.query;
    const limit = 20;
    const offset = (parseInt(page, 10) - 1) * limit;

    const currentUser = await User.findByPk(req.user.id, {
      attributes: ['role']
    });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }


    const trashMessageIds = await TrashMessage.findAll({
      attributes: ['originalMessageId'],
      where: {
        deletedBy: req.user.id
      },
      raw: true
    }).then(records => records.map(r => r.originalMessageId));


    const recipientMessageIds = await Recipient.findAll({
      attributes: ['MessageId'],
      where: {
        recipientId: req.user.id
      },
      include: [
        {
          model: Message,
          attributes: ['recipientType'],
          where: {
            recipientType: { [Op.in]: ['individual', 'multiple'] }
          }
        }
      ],
      raw: true
    }).then(records => records.map(r => r.MessageId));


    let unreadMessageIds = [];
    if (unread === 'true') {
      unreadMessageIds = await Recipient.findAll({
        attributes: ['MessageId'],
        where: {
          recipientId: req.user.id,
          read: false
        },
        raw: true
      }).then(records => records.map(r => r.MessageId));
    }


    const baseWhereClause = buildWhereClause(
      currentUser.role,
      recipientMessageIds,
    );
    

    const filterConditions = [];
    

    if (trashMessageIds.length > 0) {
      filterConditions.push({
        id: { [Op.notIn]: trashMessageIds }
      });
    }
    

    if (unread === 'true') {
      filterConditions.push({
        id: { [Op.in]: unreadMessageIds }
      });
    }
    

    if (fromContact === 'true') {
      filterConditions.push({
        fromContactForm: true
      });
    }
    

    const whereClause = {
      [Op.and]: [
        baseWhereClause,
        ...filterConditions
      ]
    };


    const includes = [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'email', 'role']
      }
    ];
    

    if (hasAttachments === 'true') {
      includes.push({
        model: Attachment,
        required: true
      });
    }

    const { count, rows } = await Message.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'subject', 'senderId', 'recipientType', 'createdAt'],
      include: includes,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    const messageIds = rows.map((m) => m.id);
    let recipientStatuses = [];
    if (messageIds.length > 0) {
      recipientStatuses = await Recipient.findAll({
        where: {
          MessageId: { [Op.in]: messageIds },
          recipientId: req.user.id
        },
        attributes: ['MessageId', 'read'],
        raw: true
      });
    }

    const readMap = {};
    recipientStatuses.forEach((r) => {
      readMap[r.MessageId] = r.read;
    });

    const messagesWithStatus = rows.map((message) => {
      const msgObj = message.toJSON();
      msgObj.read = !!readMap[message.id];
      return msgObj;
    });

    return res.json({
      messages: messagesWithStatus,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
};


/**
 * Récupère les messages envoyés par l'utilisateur connecté
 * avec pagination et filtres optionnels.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.query - Paramètres de requête
 * @param {number} [req.query.page=1] - Numéro de page pour la pagination
 * @param {string} [req.query.hasAttachments] - Filtre pour les messages avec pièces jointes ('true'/'false')
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Messages envoyés paginés avec métadonnées
 * @throws {Error} Si une erreur se produit lors de la récupération des messages
 */
const getSentMessages = async (req, res) => {
  try {
    const { page = 1, hasAttachments } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    let whereClause = {
      senderId: req.user.id
    };


    const trashMessageIds = await TrashMessage.findAll({
      attributes: ['originalMessageId'],
      where: {
        deletedBy: req.user.id
      },
      raw: true
    }).then(records => records.map(r => r.originalMessageId));


    if (trashMessageIds.length > 0) {
      whereClause.id = {
        [sequelize.Op.notIn]: trashMessageIds
      };
    }

    const { count, rows } = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        ...(hasAttachments === 'true' ? [{
          model: Attachment,
          required: true
        }] : [])
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });


    const messagesWithRecipients = await Promise.all(rows.map(async (message) => {
      const messageObj = message.toJSON();

      if (message.recipientType === 'individual' || message.recipientType === 'multiple') {
        const recipients = await Recipient.findAll({
          where: { MessageId: message.id },
          include: [{
            model: User,
            attributes: ['id', 'name', 'email', 'role']
          }]
        });
        messageObj.recipients = recipients.map(r => r.User);
      }

      return messageObj;
    }));

    res.json({
      messages: messagesWithRecipients,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};


/**
 * Récupère les messages dans la corbeille de l'utilisateur connecté.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.query - Paramètres de requête
 * @param {number} [req.query.page=1] - Numéro de page pour la pagination
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Messages dans la corbeille paginés avec métadonnées
 * @throws {Error} Si une erreur se produit lors de la récupération des messages
 */
const getTrashMessages = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;


    const trashMessages = await TrashMessage.findAll({
      attributes: ['originalMessageId'],
      where: {
        deletedBy: req.user.id,
        permanentlyDeleted: false
      },
      raw: true
    });

    const trashMessageIds = trashMessages.map(r => r.originalMessageId);

    if (trashMessageIds.length === 0) {
      return res.json({
        messages: [],
        currentPage: parseInt(page),
        totalPages: 0,
        total: 0
      });
    }

    const { count, rows } = await Message.findAndCountAll({
      where: {
        id: { [sequelize.Op.in]: trashMessageIds }
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Attachment
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });


    const messagesWithRecipients = await Promise.all(rows.map(async (message) => {
      const messageObj = message.toJSON();

      if (message.recipientType === 'individual' || message.recipientType === 'multiple') {
        const recipients = await Recipient.findAll({
          where: { MessageId: message.id },
          include: [{
            model: User,
            attributes: ['id', 'name', 'email', 'role']
          }]
        });
        messageObj.recipients = recipients.map(r => r.User);
      }

      return messageObj;
    }));

    res.json({
      messages: messagesWithRecipients,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Error fetching trash messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};


/**
 * Récupère un message spécifique avec ses détails complets.
 * Marque automatiquement le message comme lu si l'utilisateur est destinataire.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.params - Paramètres de route
 * @param {string} req.params.messageId - ID du message à récupérer
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Le message avec tous ses détails
 * @throws {Error} Si le message n'existe pas ou si l'utilisateur n'a pas la permission
 */
const getMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const currentUser = await User.findByPk(req.user.id, {
      attributes: ['role']
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let whereClause = { id: messageId };

    const message = await Message.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Attachment
        }
      ]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const isRecipient = await Recipient.findOne({
      where: {
        MessageId: messageId,
        recipientId: req.user.id
      }
    });

    const isAllStudentsMessage = message.recipientType === 'all-students' && currentUser.role === 'Etudiant';
    const isAllTeachersMessage = message.recipientType === 'all-teachers' && currentUser.role === 'Professeur';
    const isGroupMessageForUser = isAllStudentsMessage || isAllTeachersMessage;
    const isAllAdminsMessage = message.recipientType === 'all-admins' && currentUser.role === 'Administrateur';
    const isSender = message.senderId === req.user.id;

    if (!isRecipient && !isGroupMessageForUser && !isAllAdminsMessage && !isSender) {
      return res.status(403).json({ message: 'You do not have permission to view this message' });
    }

    if (isRecipient) {
      isRecipient.read = true;
      await isRecipient.save();
    }

    let recipients = [];
    if (message.recipientType === 'individual' || message.recipientType === 'multiple') {
      recipients = await Recipient.findAll({
        where: { MessageId: message.id },
        include: [{
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }]
      });
    }

    const messageData = message.toJSON();
    messageData.recipients = recipients.map(r => r.User);
    messageData.read = isRecipient ? isRecipient.read : true;

    res.json(messageData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch message' });
  }
};


/**
 * Envoie un nouveau message avec des pièces jointes optionnelles.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'expéditeur
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.subject - Sujet du message
 * @param {Array<number>} [req.body.recipients] - IDs des destinataires (obligatoire pour types 'individual' et 'multiple')
 * @param {string} req.body.recipientType - Type de destinataires ('individual', 'multiple', 'all-admins', 'all-students', 'all-teachers')
 * @param {string} req.body.content - Contenu du message
 * @param {Array<Object>} [req.files] - Pièces jointes
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Confirmation de l'envoi avec l'ID du message
 * @throws {Error} Si les données sont invalides ou si l'envoi échoue
 */
const sendMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  const attachmentsToScan = [];

  try {
    const { subject, recipients, recipientType, content } = req.body;


    if (!recipientType) {
      return res.status(400).json({ message: 'Recipient type is required' });
    }


    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }


    if (subject.length > 255) {
      return res.status(400).json({ message: 'Subject must be less than 255 characters' });
    }


    if (content.length > 250 * 1024 * 1024) { // 250MB
      return res.status(400).json({ message: 'Content must be less than 250MB' });
    }


    if (!['individual', 'multiple', 'all-admins', 'all-students', 'all-teachers'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type' });
    }


    if (recipientType === 'individual') {
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ message: 'At least one recipient is required for individual messages' });
      }
    } else if (recipientType === 'multiple') {
      if (!recipients || !Array.isArray(recipients) || recipients.length < 2) {
        return res.status(400).json({ message: 'At least two recipients are required for multiple recipient messages' });
      }
    }

    const files = req.files || [];
    const senderId = req.user.id;


    const createdMessage = await Message.create({
      subject,
      content,
      senderId,
      recipientType,
      fromContactForm: false
    }, { transaction });


    if (recipientType === 'individual' || recipientType === 'multiple') {

      for (const userId of recipients) {
        await Recipient.create({
          MessageId: createdMessage.id,
          recipientId: userId,
          read: false
        }, { transaction });
      }
    } else if (recipientType === 'all-admins' || recipientType === 'all-students' || recipientType === 'all-teachers') {

      let targetRole;
      if (recipientType === 'all-admins') targetRole = 'Administrateur';
      else if (recipientType === 'all-teachers') targetRole = 'Professeur';
      else if (recipientType === 'all-students') targetRole = 'Etudiant';


      const targetUsers = await User.findAll({
        where: { role: targetRole },
        attributes: ['id']
      }, { transaction });


      for (const user of targetUsers) {
        await Recipient.create({
          MessageId: createdMessage.id,
          recipientId: user.id,
          read: false
        }, { transaction });
      }
    }


    for (const file of files) {
      const uuid = uuidv4();
      const originalFilename = file.originalname;
      const filePath = path.join(UPLOADS_DIR, uuid);


      fs.writeFileSync(filePath, file.buffer);


      const attachment = await Attachment.create({
        id: uuid,
        MessageId: createdMessage.id,
        filename: originalFilename,
        fileSize: file.size,
        mimeType: file.mimetype,
        scanStatus: 'pending'
      }, { transaction });


      attachmentsToScan.push(attachment.id);
    }

    await transaction.commit();


    for (const attachmentId of attachmentsToScan) {
      scanAttachment(attachmentId);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: createdMessage.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};


/**
 * Marque un message comme lu pour l'utilisateur connecté.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.params - Paramètres de route
 * @param {string} req.params.messageId - ID du message à marquer comme lu
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Confirmation que le message a été marqué comme lu
 * @throws {Error} Si le message n'existe pas ou si l'utilisateur n'est pas destinataire
 */
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const recipient = await Recipient.findOne({
      where: {
        MessageId: messageId,
        recipientId: req.user.id
      }
    });

    if (!recipient) {
      return res.status(404).json({ message: 'Message not found or you are not a recipient' });
    }

    recipient.read = true;
    await recipient.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};


/**
 * Déplace un message vers la corbeille pour l'utilisateur connecté.
 * Le message n'est pas supprimé définitivement, mais marqué comme supprimé.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.params - Paramètres de route
 * @param {string} req.params.messageId - ID du message à supprimer
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Confirmation que le message a été déplacé vers la corbeille
 * @throws {Error} Si le message n'existe pas ou si l'utilisateur n'a pas la permission
 */
const deleteMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { messageId } = req.params;


    const message = await Message.findByPk(messageId);

    if (!message) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Message not found' });
    }

    let isRecipient = false;

    if (message.recipientType === 'individual' || message.recipientType === 'multiple') {
      isRecipient = await Recipient.findOne({
        where: {
          MessageId: messageId,
          recipientId: req.user.id
        }
      }) !== null;
    } else if (
      (message.recipientType === 'all-students' && req.user.role === 'Etudiant') ||
      (message.recipientType === 'all-admins' && req.user.role === 'Administrateur') ||
      (message.recipientType === 'all-teachers' && req.user.role === 'Professeur')
    ) {
      isRecipient = true;
    }

    if (message.senderId !== req.user.id && !isRecipient) {
      await transaction.rollback();
      return res.status(403).json({ message: 'You do not have permission to delete this message' });
    }


    const existingTrash = await TrashMessage.findOne({
      where: { originalMessageId: messageId, deletedBy: req.user.id }
    }, { transaction });

    if (existingTrash) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Message already in trash' });
    }


    await TrashMessage.create({
      originalMessageId: message.id,
      deletedBy: req.user.id,
      deletedAt: new Date(),
      scheduledPurgeDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
    }, { transaction });

    await transaction.commit();
    res.json({ message: 'Message moved to trash' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};


/**
 * Marque un message comme définitivement supprimé dans la corbeille.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.params - Paramètres de route
 * @param {string} req.params.messageId - ID du message à supprimer définitivement
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Confirmation que le message a été définitivement supprimé
 * @throws {Error} Si le message n'existe pas dans la corbeille
 */
const permanentlyDeleteMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { messageId } = req.params;


    const trashRecord = await TrashMessage.findOne({
      where: {
        originalMessageId: messageId,
        deletedBy: req.user.id
      }
    }, { transaction });

    if (!trashRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Message not found in trash' });
    }


    trashRecord.permanentlyDeleted = true;
    await trashRecord.save({ transaction });

    await transaction.commit();
    res.json({ message: 'Message permanently deleted' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error permanently deleting message:', error);
    res.status(500).json({ message: 'Failed to permanently delete message' });
  }
};


/**
 * Télécharge une pièce jointe d'un message.
 * Vérifie que l'utilisateur a le droit d'accéder à cette pièce jointe
 * et que le fichier a passé le scan antivirus.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.params - Paramètres de route
 * @param {string} req.params.attachmentId - ID de la pièce jointe à télécharger
 * @param {Object} res - La réponse Express
 * @returns {Promise<Stream>} Le fichier en streaming
 * @throws {Error} Si la pièce jointe n'existe pas, est infectée ou si l'utilisateur n'a pas la permission
 */
const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Attachment.findOne({
      where: { id: attachmentId },
      include: {
        model: Message,
        required: true
      }
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const message = attachment.Message;
    const isSender = message.senderId === req.user.id;
    const isRecipient = await Recipient.findOne({
      where: {
        MessageId: message.id,
        recipientId: req.user.id
      }
    });

    if (!isSender && !isRecipient) {
      return res.status(403).json({ message: 'You do not have permission to download this attachment' });
    }


    if (attachment.scanStatus === 'infected') {
      return res.status(403).json({
        message: 'This file has been identified as potentially malicious and cannot be downloaded'
      });
    }


    if (attachment.scanStatus === 'pending') {
      return res.status(400).json({
        message: 'This file is still being scanned and cannot be downloaded yet'
      });
    }

    const filePath = path.join(UPLOADS_DIR, attachment.id);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.filename)}"`);
    res.setHeader('Content-Type', attachment.mimeType);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ message: 'Failed to download attachment' });
  }
};


/**
 * Crée un message à partir d'un formulaire de contact pour les administrateurs.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.name - Nom de l'expéditeur
 * @param {string} req.body.email - Email de l'expéditeur
 * @param {string} [req.body.motif] - Motif du contact
 * @param {string} req.body.objet - Objet du message
 * @param {string} req.body.message - Contenu du message
 * @param {Array<Object>} [req.files] - Pièces jointes
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Confirmation de l'envoi avec l'ID du message
 * @throws {Error} Si les données sont invalides ou si l'envoi échoue
 */
const createContactMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  const attachmentsToScan = [];

  try {
    const { name, email, motif, objet, message } = req.body;
    const files = req.files || [];


    if (!name || !email || !message || !objet) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }


    const admins = await User.findAll({
      where: { role: 'Administrateur' },
      attributes: ['id']
    }, { transaction });

    if (admins.length === 0) {
      await transaction.rollback();
      return res.status(500).json({ message: 'Aucun administrateur trouvé pour recevoir ce message' });
    }


    const formattedContent = `
📩 **Nouveau message de contact**

👤 **Nom :** ${name}

📧 **Email :** ${email}

📌 **Motif :** ${motif || 'Non spécifié'}


📝 **Message :**

${message}
`;


    const adminMessage = await Message.create({
      subject: `Contact: ${objet}`,
      content: formattedContent,
      recipientType: 'all-admins',
      fromContactForm: true,
    }, { transaction });



    for (const admin of admins) {
      await Recipient.create({
        MessageId: adminMessage.id,
        recipientId: admin.id,
        read: false
      }, { transaction });
    }


    for (const file of files) {

      const uuid = uuidv4();
      const filename = file.originalname;
      const filePath = path.join(UPLOADS_DIR, uuid);


      fs.writeFileSync(filePath, file.buffer);


      const attachment = await Attachment.create({
        id: uuid,
        MessageId: adminMessage.id,
        filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        scanStatus: 'pending'
      }, { transaction });


      attachmentsToScan.push(attachment.id);
    }

    await transaction.commit();


    for (const attachmentId of attachmentsToScan) {
      scanAttachment(attachmentId);
    }

    res.status(201).json({
      message: 'Message envoyé avec succès.',
      id: adminMessage.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la création du message de contact:', error);


    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Données invalides', details: error.errors.map(e => e.message) });
    }

    res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi du message' });
  }
};


/**
 * Restaure un message depuis la corbeille.
 * 
 * @param {Object} req - La requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} req.params - Paramètres de route
 * @param {string} req.params.messageId - ID du message à restaurer
 * @param {Object} res - La réponse Express
 * @returns {Promise<Object>} Confirmation que le message a été restauré
 * @throws {Error} Si le message n'existe pas dans la corbeille ou si l'utilisateur n'a pas la permission
 */
const restoreMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { messageId } = req.params;


    const trashRecord = await TrashMessage.findOne({
      where: {
        originalMessageId: messageId,
        deletedBy: req.user.id
      }
    }, { transaction });

    if (!trashRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Message not found in trash' });
    }


    const message = await Message.findByPk(messageId, { transaction });
    if (!message) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Message not found' });
    }


    const isSender = message.senderId === req.user.id;
    const isRecipient = await Recipient.findOne({
      where: {
        MessageId: message.id,
        recipientId: req.user.id
      },
      transaction
    });

    if (!isSender && !isRecipient) {
      await transaction.rollback();
      return res.status(403).json({ message: 'You do not have permission to restore this message' });
    }


    await trashRecord.destroy({ transaction });

    await transaction.commit();
    res.json({ message: 'Message restored from trash' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error restoring message:', error);
    res.status(500).json({ message: 'Failed to restore message' });
  }
};

module.exports = {
  getInboxMessages,
  getSentMessages,
  getTrashMessages,
  getMessage,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  permanentlyDeleteMessage,
  downloadAttachment,
  createContactMessage,
  restoreMessage
};