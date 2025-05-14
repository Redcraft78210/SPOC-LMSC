
// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { createContactMessage } = require('../controllers/messageController');

// Public route for contact form submissions
router.post('/', createContactMessage);

module.exports = { route: router };