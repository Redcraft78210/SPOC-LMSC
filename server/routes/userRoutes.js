import express from 'express';

import {
  getAllUsers,
  getUserById,
  updateUserById,
  changeStatus,
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

router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.patch('/:id', authMiddleware, changeStatus);
router.patch('/retrograde/:id', authMiddleware, retrogradeUser);
router.patch('/upgrade/:id', authMiddleware, upgradeUser);
router.put('/:id', authMiddleware, updateUserById);
router.delete('/:id', authMiddleware, deleteUserById);
router.put('/change-password', authMiddleware, changePassword);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);

export default router;

