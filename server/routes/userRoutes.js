// server/routes/userRoutes.js

const express = require('express');
const { User } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware'); // Ensure the user is authenticated
const validateUser = require('../middlewares/userValidation'); // Validation middleware for user update
const router = express.Router();

router.use(authMiddleware);


// Get the authenticated user's profile (GET /api/users/me)
router.get('/me', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // Fetch the user based on the ID in the JWT token
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update user's profile (PUT /api/users/me)
router.put('/me', validateUser, async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Find the user by ID from the JWT token
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;

    // If password is provided, hash and update it
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Change user's password (POST /api/users/me/password)
router.post('/me/password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  try {
    // Find the user by ID from the JWT token
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the old password with the stored password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password and save it
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
