import express from 'express';

import {
  getAllUsers,
  getUserById,
  updateUserById,
  changeStatus,
  disable2FA,
  deleteUserById,
  changePassword,
  getProfile,
  updateProfile,
  deleteProfile,
  retrogradeUser,
  upgradeUser
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all users
router.get('/', authMiddleware, getAllUsers);

// Get the user profile
router.get('/profile', authMiddleware, getProfile);

// Get a user by its ID
router.get('/:id', authMiddleware, getUserById);

// Update a user status
router.patch('/:id', authMiddleware, changeStatus);

// Retrograde a user
router.patch('/retrograde/:id', authMiddleware, retrogradeUser);

// Upgrade a user
router.patch('/upgrade/:id', authMiddleware, upgradeUser);

// Update the user profile
router.put('/profile', authMiddleware, updateProfile);

// Update a user
router.put('/:id', authMiddleware, updateUserById);

// Change the user password
router.put('/change-password', authMiddleware, changePassword);

// Disable 2FA for user
router.delete('/2fa', authMiddleware, disable2FA);

// Delete a user
router.delete('/:id', authMiddleware, deleteUserById);

// Delete the user profile
router.delete('/profile', authMiddleware, deleteProfile);

export default router;

