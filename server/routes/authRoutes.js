// server/routes/authRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const validateUser = require('../middlewares/userValidation'); // Validation middleware for user registration
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Register route with validation middleware
router.post('/register', validateUser, register);

// Login route with validation
router.post('/login', login);

module.exports = router;
