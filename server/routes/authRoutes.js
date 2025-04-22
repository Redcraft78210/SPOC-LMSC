// server/routes/authRoutes.js

import express from 'express';
import validateUser from '../middlewares/userValidation.js'; // Validation middleware for user registration
import { checkRegisterCode, register, login, verify2FA, refresh2FASetup } from '../controllers/authController.js'; // Import the register and login functions from the controller module

const router = express.Router();

// Registration code check route
router.post('/check-register-code', checkRegisterCode);

// Register route with validation middleware
router.post('/register', validateUser, register);

// Login route with validation
router.post('/login', login);

// 2FA setup route
router.post('/activate-2fa', verify2FA);

// 2FA verification route
router.post('/verify-2fa', verify2FA)

// 2FA refresh setup temp token route
router.post('/refresh-2fa-setup', refresh2FASetup);

export default router;