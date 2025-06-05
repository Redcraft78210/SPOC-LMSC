// controllers/messageController.js
const { Message, User, Attachment, sequelize, TrashMessage, Recipient } = require('../models');
const { scanAttachment } = require('../services/virusScanService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Get inbox messages
const { Op } = require('sequelize');

// Helper pour construire le whereClause
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

    // Get trash message IDs
    const trashMessageIds = await TrashMessage.findAll({
      attributes: ['originalMessageId'],
      where: {
        deletedBy: req.user.id
      },
      raw: true
    }).then(records => records.map(r => r.originalMessageId));

    // Get recipient message IDs
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

    // Get unread message IDs if unread filter is active
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

    // Start building base where clause from buildWhereClause function
    const baseWhereClause = buildWhereClause(
      currentUser.role,
      recipientMessageIds,
    );
    
    // Initialize an array to collect all filter conditions
    const filterConditions = [];
    
    // Always exclude trash messages
    if (trashMessageIds.length > 0) {
      filterConditions.push({
        id: { [Op.notIn]: trashMessageIds }
      });
    }
    
    // Apply unread filter strictly if active
    if (unread === 'true') {
      filterConditions.push({
        id: { [Op.in]: unreadMessageIds }
      });
    }
    
    // Apply fromContact filter strictly if active
    if (fromContact === 'true') {
      filterConditions.push({
        fromContactForm: true
      });
    }
    
    // Combine all filters with base where clause using AND
    const whereClause = {
      [Op.and]: [
        baseWhereClause,
        ...filterConditions
      ]
    };

    // Build includes array
    const includes = [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'email', 'role']
      }
    ];
    
    // Apply hasAttachments filter strictly if active
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

// Get sent messages
const getSentMessages = async (req, res) => {
  try {
    const { page = 1, hasAttachments } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    let whereClause = {
      senderId: req.user.id
    };

    // First, get the IDs of messages in trash
    const trashMessageIds = await TrashMessage.findAll({
      attributes: ['originalMessageId'],
      where: {
        deletedBy: req.user.id
      },
      raw: true
    }).then(records => records.map(r => r.originalMessageId));

    // Now exclude those IDs from the main query
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

    // For each message, get recipients
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

// Get deleted messages (trash)
const getTrashMessages = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get all messages in trash for this user
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

    // For each message, get recipients if needed
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

// Get specific message
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

// Send message
const sendMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  const attachmentsToScan = [];

  try {
    const { subject, recipients, recipientType, content } = req.body;

    // Validate required fields
    if (!recipientType) {
      return res.status(400).json({ message: 'Recipient type is required' });
    }

    // Ensure subject and content are provided
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    // Validate subject length
    if (subject.length > 255) {
      return res.status(400).json({ message: 'Subject must be less than 255 characters' });
    }

    // Validate content length to 250MB
    if (content.length > 250 * 1024 * 1024) { // 250MB
      return res.status(400).json({ message: 'Content must be less than 250MB' });
    }

    // Validate recipientType against model's enum values
    if (!['individual', 'multiple', 'all-admins', 'all-students', 'all-teachers'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type' });
    }

    // Validate recipients based on type
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

    // Create message
    const createdMessage = await Message.create({
      subject,
      content,
      senderId,
      recipientType,
      fromContactForm: false
    }, { transaction });

    // Handle recipients based on type
    if (recipientType === 'individual' || recipientType === 'multiple') {
      // Add entries to Recipients table for each recipient
      for (const userId of recipients) {
        await Recipient.create({
          MessageId: createdMessage.id,
          recipientId: userId,
          read: false
        }, { transaction });
      }
    } else if (recipientType === 'all-admins' || recipientType === 'all-students' || recipientType === 'all-teachers') {
      // Determine which role to fetch
      let targetRole;
      if (recipientType === 'all-admins') targetRole = 'Administrateur';
      else if (recipientType === 'all-teachers') targetRole = 'Professeur';
      else if (recipientType === 'all-students') targetRole = 'Etudiant';

      // Fetch all users with the target role
      const targetUsers = await User.findAll({
        where: { role: targetRole },
        attributes: ['id']
      }, { transaction });

      // Create a recipient entry for each user
      for (const user of targetUsers) {
        await Recipient.create({
          MessageId: createdMessage.id,
          recipientId: user.id,
          read: false
        }, { transaction });
      }
    }

    // Process attachments
    for (const file of files) {
      const uuid = uuidv4();
      const originalFilename = file.originalname;
      const filePath = path.join(UPLOADS_DIR, uuid);

      // Save file
      fs.writeFileSync(filePath, file.buffer);

      // Create attachment record
      const attachment = await Attachment.create({
        id: uuid,
        MessageId: createdMessage.id,
        filename: originalFilename,
        fileSize: file.size,
        mimeType: file.mimetype,
        scanStatus: 'pending'
      }, { transaction });

      // Store for scanning after transaction commits
      attachmentsToScan.push(attachment.id);
    }

    await transaction.commit();

    // Scan attachments after transaction is committed
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

// Mark message as read - updated to use Recipient table
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

// Delete message (move to trash)
const deleteMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { messageId } = req.params;

    // Check if message exists
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

    // Check if message is already in trash
    const existingTrash = await TrashMessage.findOne({
      where: { originalMessageId: messageId, deletedBy: req.user.id }
    }, { transaction });

    if (existingTrash) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Message already in trash' });
    }

    // Create entry in TrashMessage table
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

// Permanently delete message
const permanentlyDeleteMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { messageId } = req.params;

    // Find the message in trash by checking TrashMessage table
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

    // Update TrashMessage record
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

// Download attachment
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

    // Don't allow download of infected files
    if (attachment.scanStatus === 'infected') {
      return res.status(403).json({
        message: 'This file has been identified as potentially malicious and cannot be downloaded'
      });
    }

    // Don't allow download of files that are still being scanned
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

// Create message from contact form
const createContactMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  const attachmentsToScan = [];

  try {
    const { name, email, motif, objet, message } = req.body;
    const files = req.files || [];

    // Validate required fields
    if (!name || !email || !message || !objet) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Find admin users to send the message to
    const admins = await User.findAll({
      where: { role: 'Administrateur' },
      attributes: ['id']
    }, { transaction });

    if (admins.length === 0) {
      await transaction.rollback();
      return res.status(500).json({ message: 'Aucun administrateur trouvé pour recevoir ce message' });
    }

    // Create a formatted message content
    const formattedContent = `
📩 **Nouveau message de contact**

👤 **Nom :** ${name}

📧 **Email :** ${email}

📌 **Motif :** ${motif || 'Non spécifié'}


📝 **Message :**

${message}
`;

    // Create messages for each admin
    const adminMessage = await Message.create({
      subject: `Contact: ${objet}`,
      content: formattedContent,
      recipientType: 'all-admins',
      fromContactForm: true,
    }, { transaction });

    // Add entries in the Recipients table for each admin
    // This allows tracking read status for each admin individually
    for (const admin of admins) {
      await Recipient.create({
        MessageId: adminMessage.id,
        recipientId: admin.id,
        read: false
      }, { transaction });
    }

    // Process attachments for each message
    for (const file of files) {
      // Generate unique filename
      const uuid = uuidv4();
      const filename = file.originalname;
      const filePath = path.join(UPLOADS_DIR, uuid);

      // Save file to storage
      fs.writeFileSync(filePath, file.buffer);

      // Create attachment record
      const attachment = await Attachment.create({
        id: uuid,
        MessageId: adminMessage.id,
        filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        scanStatus: 'pending'
      }, { transaction });

      // Store for scanning after transaction commits
      attachmentsToScan.push(attachment.id);
    }

    await transaction.commit();

    // Scan attachments after transaction is committed
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

    // More specific error handling
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Données invalides', details: error.errors.map(e => e.message) });
    }

    res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi du message' });
  }
};

// Restore message from trash
const restoreMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { messageId } = req.params;

    // Find the trash record
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

    // Verify message exists and user is sender or recipient
    const message = await Message.findByPk(messageId, { transaction });
    if (!message) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender or recipient
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

    // Delete the trash record to restore the message
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