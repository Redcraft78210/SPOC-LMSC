// server/routes/authRoutes.js

import express from 'express';
import validateUser from '../middlewares/userValidation.js'; // Validation middleware for user registration
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRegisterCode, register, manualRegister, firstLogin, login, activate2FA, verify2FA, refresh2FASetup } from '../controllers/authController.js'; // Import the register and login functions from the controller module

const router = express.Router();

// Registration code check route
router.post('/check-register-code', checkRegisterCode);

// Register route with validation middleware
router.post('/register', validateUser, register);

// Register route with validation middleware. Registration from teacher/admin panel
router.post('/manual-register', validateUser, manualRegister);

// First login route
router.post('/first-login', authMiddleware, firstLogin);

// Login route with validation
router.post('/login', login);

// 2FA setup route
router.post('/activate-2fa', authMiddleware, activate2FA);

// 2FA verification route
router.post('/verify-2fa', verify2FA)

// 2FA refresh setup temp token route
router.post('/refresh-2fa-setup', refresh2FASetup);

export default router;