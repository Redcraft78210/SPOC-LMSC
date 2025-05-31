// routes/messageRoutes.js
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

// Configure multer for memory storage (files will be processed and saved manually)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024, // 1GB max file size
    files: 5 // Max 5 files per request
  }
});

// Protected routes
router.use(authMiddleware);

// Get messages
router.get('/inbox', getInboxMessages);
router.get('/sent', getSentMessages);
router.get('/trash', getTrashMessages);
router.get('/:messageId', getMessage);

// Create a new message
router.post('/', upload.array('attachments', 5), sendMessage);

// Create a new message with contact form
router.post('/contact', upload.array('attachments', 5), createContactMessage);
// Create a new message without attachments
router.post('/no-attachments', sendMessage);
// Create a new message without attachments and with contact form
router.post('/contact/no-attachments', createContactMessage);

// Message actions
router.patch('/:messageId/trash', moveToTrash);
router.patch('/:messageId/restore', restoreFromTrash);
router.patch('/:messageId/read', markMessageAsRead);

router.delete('/:messageId', permanentlyDeleteMessage);

// Attachments
router.get('/attachments/:attachmentId', downloadAttachment);

module.exports = { route: router };
