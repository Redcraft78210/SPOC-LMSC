import express from 'express';

import { getAllUsers, getUserById, updateUserById, deleteUserById, changePassword, getProfile, updateProfile, deleteProfile } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Assuming you have an auth middleware

const router = express.Router();

// Route to get all users
router.get('/', authMiddleware, getAllUsers);

// Route to get user by ID
router.get('/:id', authMiddleware, getUserById);

// Route to update user by ID
router.put('/:id', authMiddleware, updateUserById);

// Route to delete user by ID
router.delete('/:id', authMiddleware, deleteUserById);

// Route to change user password
router.put('/change-password', authMiddleware, changePassword);

// Route to get user profile
router.get('/profile', authMiddleware, getProfile);

// Route to update user profile
router.put('/profile', authMiddleware, updateProfile);

// Route to delete user profile
router.delete('/profile', authMiddleware, deleteProfile);

export default router;
