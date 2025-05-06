const { User } = require('../models');
const bcrypt = require('bcrypt');

// Get the authenticated user's profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({
            id: user.id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            twoFAEnabled: user.twoFAEnabled
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update user's profile
const updateProfile = async (req, res) => {
    const { name, surname, email, password } = req.body;

    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;

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
};

const changeStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        const newStatus = req.body.statut ? 'actif' : 'inactif';
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.statut = newStatus;
        await user.save();

        return res.status(200).json({ message: 'Status changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const disable2FA = async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.twoFAEnabled) {
            user.twoFAEnabled = false;
            user.twoFASecret = null;
        }
        await user.save();

        return res.status(200).json({ message: 'Status changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Change user's password
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete user's profile
const deleteProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        return res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        return res.status(200).json(users.map(user => ({
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            active: user.statut,
            role: user.role === 'admin' ? 'Administrateur' :
                user.role === 'teacher' ? 'Professeur' :
                    'Etudiant'
        })));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update user by ID
const updateUserById = async (req, res) => {
    const { name, surname, email, currentPassword, newPassword, password, role, isPasswordGeneratedByAdmin } = req.body;

    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        if (currentPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        if (isPasswordGeneratedByAdmin) {
            user.firstLogin = true;
        }

        await user.save();

        return res.status(200).json({
            message: 'User updated successfully',
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
};

// Delete user by ID
const deleteUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const retrogradeUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        switch (user.role) {
            case 'admin':
                user.role = 'teacher';
                break;
            case 'teacher':
                user.role = 'student';
                break;
        }
        await user.save();
        return res.status(200).json({ message: 'User retrograded successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const upgradeUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        switch (user.role) {
            case 'student':
                user.role = 'teacher';
                break;
            case 'teacher':
                user.role = 'admin';
                break;
        }
        await user.save();
        return res.status(200).json({ message: 'User upgraded successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    disable2FA,
    changeStatus,
    deleteProfile,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    retrogradeUser,
    upgradeUser
};