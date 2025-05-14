// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { getInboxMessages,
  getSentMessages,
  getTrashMessages,
  getMessage,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  downloadAttachment,
  createContactMessage } = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage (files will be processed and saved manually)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
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

// Message actions
router.put('/:messageId/read', markMessageAsRead);
router.delete('/:messageId', deleteMessage);

// Attachments
router.get('/attachments/:attachmentId', downloadAttachment);

module.exports = { route: router };
