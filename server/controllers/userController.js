/**
 * @fileoverview Contrôleur pour la gestion des utilisateurs
 * Ce module contient des fonctions pour gérer les profils utilisateurs, les permissions,
 * l'authentification à deux facteurs, et les opérations administratives sur les comptes.
 * @module controllers/userController
 * @requires models
 * @requires bcrypt
 * @requires zxcvbn
 */
const { User, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn');

/**
 * Récupère le profil de l'utilisateur actuellement authentifié
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - L'ID de l'utilisateur authentifié
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Données du profil utilisateur
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
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


/**
 * Met à jour le profil de l'utilisateur authentifié
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - L'ID de l'utilisateur authentifié
 * @param {Object} req.body - Les données à mettre à jour
 * @param {string} [req.body.name] - Le nouveau prénom
 * @param {string} [req.body.surname] - Le nouveau nom de famille
 * @param {string} [req.body.username] - Le nouveau nom d'utilisateur
 * @param {string} [req.body.email] - La nouvelle adresse email
 * @param {string} [req.body.password] - Le nouveau mot de passe
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation et données mises à jour
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
const updateProfile = async (req, res) => {
    const { name, surname, username, email, password } = req.body;

    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.username = username || user.username;
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
                surname: user.surname,
                username: user.username,
                email: user.email,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Change le statut d'un utilisateur entre 'actif' et 'inactif'
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - L'ID de l'utilisateur authentifié
 * @param {Object} req.params - Les paramètres de la requête
 * @param {number} req.params.id - L'ID de l'utilisateur dont le statut doit être modifié
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation
 * @throws {Error} Erreur 403 si l'utilisateur tente de modifier son propre statut
 * @throws {Error} Erreur 404 si l'utilisateur cible n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
const changeStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        const newStatus = user.statut === 'actif' ? 'inactif' : 'actif';

        if (req.user.id === user.id) {
            return res.status(403).json({ message: 'You cannot change your own status' });
        }

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

/**
 * Récupère le statut de l'authentification à deux facteurs pour l'utilisateur authentifié
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - L'ID de l'utilisateur authentifié
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Statut d'activation de la 2FA
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
const get2FAStatus = async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ is2FAEnabled: user.twoFAEnabled });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Désactive l'authentification à deux facteurs pour l'utilisateur authentifié
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - L'ID de l'utilisateur authentifié
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
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

/**
 * Change le mot de passe de l'utilisateur authentifié après validation
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - L'ID de l'utilisateur authentifié
 * @param {Object} req.body - Les données de la requête
 * @param {string} req.body.oldPassword - L'ancien mot de passe
 * @param {string} req.body.newPassword - Le nouveau mot de passe
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation
 * @throws {Error} Erreur 400 si l'ancien mot de passe est incorrect ou si le nouveau est trop faible
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
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


        const passwordStrength = zxcvbn(newPassword);
        if (passwordStrength.score < 3) {
            return res.status(400).json({
                message: 'Password is too weak',
                feedback: passwordStrength.feedback.suggestions,
                score: passwordStrength.score
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Supprime le profil de l'utilisateur authentifié
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {number} req.user.id - L'ID de l'utilisateur authentifié
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
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

/**
 * Récupère la liste de tous les utilisateurs avec filtrage optionnel par rôle
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - L'utilisateur authentifié
 * @param {string} req.user.role - Le rôle de l'utilisateur authentifié
 * @param {Object} req.query - Les paramètres de requête
 * @param {string} [req.query.role] - Filtre par rôle
 * @param {boolean} [req.query.mailboxrecipients] - Format spécial pour les destinataires de messages
 * @param {Object} res - L'objet réponse Express
 * @returns {Array} Liste des utilisateurs filtrés
 * @throws {Error} Erreur 404 si aucun utilisateur n'est trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
const getAllUsers = async (req, res) => {
    const { role, mailboxrecipients } = req.query;
    const userRole = req.user.role;
    console.log(userRole);

    try {


        let where = {};
        if (role) {
            where.role = role;
        }


        if (userRole === 'Etudiant') {
            where.role = { [sequelize.Op.ne]: 'Administrateur' }; // Exclure 'Administrateur'
        }

        const users = await User.findAll({ where });


        if (!users.length) {
            return res.status(404).json({ message: 'No users found' });
        }

        const result = users.map(({ id, name, surname, email, statut, role }) => {

            const output = { id, surname, role };


            if (!mailboxrecipients) {
                output.name = name;
                output.email = email;
                output.active = statut;
            } else {
                output.name = role === "Professeur" ? "Professeur" : name;
            }

            return output;
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Récupère un utilisateur par son ID
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {number} req.params.id - L'ID de l'utilisateur à récupérer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Données de l'utilisateur
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
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

/**
 * Met à jour un utilisateur par son ID
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {number} req.params.id - L'ID de l'utilisateur à mettre à jour
 * @param {Object} req.body - Les données à mettre à jour
 * @param {string} [req.body.name] - Le nouveau prénom
 * @param {string} [req.body.surname] - Le nouveau nom de famille
 * @param {string} [req.body.email] - La nouvelle adresse email
 * @param {string} [req.body.currentPassword] - Le mot de passe actuel
 * @param {string} [req.body.newPassword] - Le nouveau mot de passe
 * @param {string} [req.body.role] - Le nouveau rôle
 * @param {boolean} [req.body.isPasswordGeneratedByAdmin] - Indique si le mot de passe a été généré par un admin
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation et données mises à jour
 * @throws {Error} Erreur 400 si le mot de passe actuel est incorrect
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
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

        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        } else if (newPassword) {
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

/**
 * Supprime un utilisateur par son ID
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {number} req.params.id - L'ID de l'utilisateur à supprimer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
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

/**
 * Rétrograde le rôle d'un utilisateur (Administrateur → Professeur → Etudiant)
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {number} req.params.id - L'ID de l'utilisateur à rétrograder
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
const retrogradeUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        switch (user.role) {
            case 'Administrateur':
                user.role = 'Professeur';
                break;
            case 'Professeur':
                user.role = 'Etudiant';
                break;
        }
        await user.save();
        return res.status(200).json({ message: 'User retrograded successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Promeut le rôle d'un utilisateur (Etudiant → Professeur → Administrateur)
 * @async
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {number} req.params.id - L'ID de l'utilisateur à promouvoir
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation
 * @throws {Error} Erreur 404 si l'utilisateur n'est pas trouvé
 * @throws {Error} Erreur 500 en cas d'erreur serveur
 */
const upgradeUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        switch (user.role) {
            case 'Etudiant':
                user.role = 'Professeur';
                break;
            case 'Professeur':
                user.role = 'Administrateur';
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
    get2FAStatus,
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