const express = require('express');

const {
  getAllUsers,
  getUserById,
  updateUserById,
  changeStatus,
  get2FAStatus,
  disable2FA,
  deleteUserById,
  changePassword,
  getProfile,
  updateProfile,
  deleteProfile,
  retrogradeUser,
  upgradeUser
} = require('../controllers/userController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.use(authMiddleware);

// Get all users
router.get('/', getAllUsers);

// Get the user profile
router.get('/profile', getProfile);

// Get 2FA Status for a user
router.get('/2fa', get2FAStatus);

// Get a user by its ID
router.get('/:id', getUserById);

// Retrograde a user
router.patch('/retrograde/:id', retrogradeUser);

// Upgrade a user
router.patch('/upgrade/:id', upgradeUser);

// Update the user profile
router.put('/profile', updateProfile);

// Update a user status
router.patch('/:id', changeStatus);

// Change the user password
router.put('/change-password', changePassword);

// Update a user
router.put('/:id', updateUserById);

// Disable 2FA for user
router.delete('/2fa', disable2FA);

// Delete the user profile
router.delete('/profile', deleteProfile);

// Delete a user
router.delete('/:id', deleteUserById);

module.exports = { route: router };
