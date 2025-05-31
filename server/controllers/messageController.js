// controllers/messageController.js
const { Message, User, Attachment, sequelize, TrashMessage } = require('../models');
const { scanAttachment } = require('../services/virusScanService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Get inbox messages
const getInboxMessages = async (req, res) => {
  try {
    const { page = 1, unread, hasAttachments, fromContact } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get user role for group message filtering
    const currentUser = await User.findByPk(req.user.id, {
      attributes: ['role']
    });
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First, get the IDs of messages in trash
    const trashMessageIds = await TrashMessage.findAll({
      attributes: ['originalMessageId'],
      where: {
        deletedBy: req.user.id
      },
      raw: true
    }).then(records => records.map(r => r.originalMessageId));

    // Build where clause to include both direct messages and group messages for the user's role
    let whereClause = {
      [sequelize.Op.or]: [
        { recipientId: req.user.id },
        { recipientType: `all-${currentUser.role}s` } // Match 'all-students', 'all-teachers', 'all-admins'
      ]
    };

    if (unread === 'true') {
      whereClause.read = false;
    }

    if (fromContact === 'true') {
      whereClause.fromContactForm = true;
    }

    // Exclude messages in trash
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
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'email', 'role'],
          required: false // Make this optional since group messages won't have a recipient
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

    res.json({
      messages: rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
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
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'email', 'role'],
          required: false // Make this optional for group messages
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

    res.json({
      messages: rows,
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

    const { count, rows } = await Message.findAndCountAll({
      where: {
        [sequelize.Op.or]: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
        ]
        // Removed deleted: true as this column doesn't exist
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Attachment
        },
        {
          model: TrashMessage,
          required: true, // Ensure there's an entry in TrashMessage
          where: {
            deletedBy: req.user.id, // Deleted by current user
            permanentlyDeleted: false // Only get non-permanently deleted messages
          }
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    res.json({
      messages: rows,
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
    
    // Get user role for checking group message access
    const currentUser = await User.findByPk(req.user.id, {
      attributes: ['role']
    });
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const message = await Message.findOne({
      where: {
        id: messageId,
        [sequelize.Op.or]: [
          { senderId: req.user.id },
          { recipientId: req.user.id },
          { recipientType: `all-${currentUser.role}s` } // Include group messages for user's role
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'email', 'role'],
          required: false // Make this optional since group messages won't have a recipient
        },
        {
          model: Attachment
        }
      ]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  const attachmentsToScan = [];

  try {
    const { subject, content, recipients, recipientType } = req.body;

    // Validate required fields
    if (!recipientType) {
      return res.status(400).json({ message: 'Recipient type is required' });
    }
    if (recipientType !== 'all-students' && recipientType !== 'all-teachers' && recipientType !== 'all-admins' && !recipients) {
      return res.status(400).json({ message: 'Recipients are required for individual messages' });
    }
    // Ensure subject and content are provided
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }
    // Ensure recipients is an array if provided for individual messages
    if (recipientType === 'individual' && (!recipients || !Array.isArray(recipients))) {
      return res.status(400).json({ message: 'Recipients must be an array for individual messages' });
    }
    // Ensure files are provided
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: 'At least one file is required' });
    }

    const files = req.files || [];
    const senderId = req.user.id;
    const createdMessages = [];

    // Handle group messages (single message with recipientType)
    if (['all-students', 'all-teachers', 'all-admins'].includes(recipientType)) {
      // Create just one message for the entire group
      const message = await Message.create({
        subject,
        content,
        senderId,
        recipientType, // Store the group type instead of individual recipientId
        recipientId: null, // No specific recipient for group messages
        fromContactForm: false
      }, { transaction });

      createdMessages.push(message);

      // Process attachments for the group message
      for (const file of files) {
        const uuid = uuidv4();
        const originalFilename = file.originalname;
        const filePath = path.join(UPLOADS_DIR, uuid);

        // Save file
        fs.writeFileSync(filePath, file.buffer);

        // Create attachment record
        const attachment = await Attachment.create({
          id: uuid,
          MessageId: message.id,
          filename: originalFilename,
          fileSize: file.size,
          mimeType: file.mimetype,
          scanStatus: 'pending'
        }, { transaction });

        // Store for scanning after transaction commits
        attachmentsToScan.push(attachment.id);
      }
    } else {
      // Individual recipients - create separate messages
      if (!recipients || !recipients.length) {
        return res.status(400).json({ message: 'At least one recipient is required' });
      }
      
      const recipientIds = Array.isArray(recipients) ? recipients : [recipients];

      for (const recipientId of recipientIds) {
        const message = await Message.create({
          subject,
          content,
          senderId,
          recipientId,
          recipientType: 'individual',
          fromContactForm: false
        }, { transaction });

        createdMessages.push(message);

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
            MessageId: message.id,
            filename: originalFilename,
            fileSize: file.size,
            mimeType: file.mimetype,
            scanStatus: 'pending'
          }, { transaction });

          // Store for scanning after transaction commits
          attachmentsToScan.push(attachment.id);
        }
      }
    }

    await transaction.commit();

    // Scan attachments after transaction is committed
    for (const attachmentId of attachmentsToScan) {
      scanAttachment(attachmentId);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      messageIds: createdMessages.map(m => m.id)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      where: {
        id: messageId,
        recipientId: req.user.id
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.read = true;
    await message.save();

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

    // Check if message exists and belongs to user
    const message = await Message.findOne({
      where: {
        id: messageId,
        [sequelize.Op.or]: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
        ]
      }
    }, { transaction });

    if (!message) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Message not found' });
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

    // No need to mark original message as deleted since the column doesn't exist
    // We only track deletion through the TrashMessage table

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
        where: {
          [sequelize.Op.or]: [
            { senderId: req.user.id },
            { recipientId: req.user.id }
          ]
        },
        required: true
      }
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
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
  const attachmentsToScan = []; // Add this line

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
      where: { role: 'admin' },
      attributes: ['id']
    }, { transaction });

    if (admins.length === 0) {
      await transaction.rollback();
      return res.status(500).json({ message: 'Aucun administrateur trouvé pour recevoir ce message' });
    }

    // Create a formatted message content
    const formattedContent = `
Message du formulaire de contact:

De: ${name}
Email: ${email}
Motif: ${motif || 'Non spécifié'}

Message:
${message}
    `;

    // Create messages for each admin
    const createdMessages = [];
    for (const admin of admins) {
      const adminMessage = await Message.create({
        subject: `Contact: ${objet}`,
        content: formattedContent,
        recipientType: 'individual',
        fromContactForm: true,
        senderEmail: email // Store sender's email for reference
      }, { transaction });

      createdMessages.push(adminMessage);

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
    }

    await transaction.commit();

    // Scan attachments after transaction is committed
    for (const attachmentId of attachmentsToScan) {
      scanAttachment(attachmentId);
    }

    res.status(201).json({
      message: 'Message envoyé avec succès.',
      messageIds: createdMessages.map(m => m.id)
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

    // Verify message exists
    const message = await Message.findOne({
      where: {
        id: messageId,
        [sequelize.Op.or]: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
        ]
      }
    }, { transaction });

    if (!message) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Message not found' });
    }

    // Delete the trash record to restore the message
    await trashRecord.destroy({ transaction });

    // No need to update message.deleted since the column doesn't exist

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