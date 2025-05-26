// controllers/messageController.js
const { Message, User, Attachment, sequelize } = require('../models');
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

    let whereClause = {
      recipientId: req.user.id,
      deleted: false
    };

    if (unread === 'true') {
      whereClause.read = false;
    }

    if (fromContact === 'true') {
      whereClause.fromContactForm = true;
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
      senderId: req.user.id,
      deleted: false
    };

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

// Get deleted messages
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
        ],
        deleted: true
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

    const message = await Message.findOne({
      where: {
        id: messageId,
        [sequelize.Op.or]: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
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

    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { subject, content, recipients, recipientType } = req.body;
    console.log(req);
    
    const files = req.files || [];
    const senderId = req.user.id;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    let recipientIds = [];

    // Determine recipients based on type
    if (recipientType === 'all-students') {
      const students = await User.findAll({
        where: { role: 'student' },
        attributes: ['id']
      });
      recipientIds = students.map(student => student.id);
    } else if (recipientType === 'all-teachers') {
      const teachers = await User.findAll({
        where: { role: 'teacher' },
        attributes: ['id']
      });
      recipientIds = teachers.map(teacher => teacher.id);
    } else if (recipientType === 'all-admins') {
      const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: ['id']
      });
      recipientIds = admins.map(admin => admin.id);
    } else {
      // Individual recipients
      if (!recipients || !recipients.length) {
        return res.status(400).json({ message: 'At least one recipient is required' });
      }
      recipientIds = Array.isArray(recipients) ? recipients : [recipients];
    }

    // Create messages for each recipient
    const createdMessages = [];

    for (const recipientId of recipientIds) {
      const message = await Message.create({
        subject,
        content,
        senderId,
        recipientId,
        fromContactForm: false
      }, { transaction });

      createdMessages.push(message);

      // Process attachments
      for (const file of files) {
        const uuid = uuidv4();
        const filename = uuid;
        const originalFilename = file.originalname;
        const filePath = path.join(UPLOADS_DIR, filename);

        // Save file
        fs.writeFileSync(filePath, file.buffer);

        // Create attachment record
        const attachment = await Attachment.create({
          MessageId: message.id,
          filename,
          originalFilename,
          fileSize: file.size,
          mimeType: file.mimetype,
          scanStatus: 'pending'
        }, { transaction });

        // Start virus scan asynchronously
        scanAttachment(attachment.id);
      }
    }

    await transaction.commit();

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

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      where: {
        id: messageId,
        [sequelize.Op.or]: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
        ]
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.deleted = true;
    await message.save();

    res.json({ message: 'Message moved to trash' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
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

    const filePath = path.join(UPLOADS_DIR, attachment.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.originalFilename)}"`);
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

    // Create a contact message record for tracking purposes
    const contactRecord = {
      name,
      email,
      motif,
      objet,
      message,
      date: new Date()
    };
    
    // Store contact records in a separate table if needed
    // await ContactForm.create(contactRecord, { transaction });

    // Create messages for each admin
    const createdMessages = [];
    for (const admin of admins) {
      const adminMessage = await Message.create({
        subject: `Contact: ${objet}`,
        content: formattedContent,
        recipientId: admin.id,
        fromContactForm: true,
        senderEmail: email // Store sender's email for reference
      }, { transaction });

      createdMessages.push(adminMessage);

      // Process attachments for each message
      for (const file of files) {
        // Generate unique filename
        const uuid = uuidv4();
        const filename = uuid;
        const filePath = path.join(UPLOADS_DIR, filename);

        // Save file to storage
        fs.writeFileSync(filePath, file.buffer);

        // Create attachment record
        const attachment = await Attachment.create({
          MessageId: adminMessage.id,
          filename,
          originalFilename: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          scanStatus: 'pending'
        }, { transaction });

        // Start virus scan asynchronously
        scanAttachment(attachment.id);
      }
    }

    await transaction.commit();
    
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

module.exports = {
  getInboxMessages,
  getSentMessages,
  getTrashMessages,
  getMessage,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  downloadAttachment,
  createContactMessage
};