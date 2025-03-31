// server/routes/authRoutes.js

import express from 'express';
import validateUser from '../middlewares/userValidation.js'; // Validation middleware for user registration
import { register, login } from '../controllers/authController.js'; // Import the register and login functions from the controller module

const router = express.Router();

// Register route with validation middleware
router.post('/register', validateUser, register);

// Login route with validation
router.post('/login', login);

export default router;