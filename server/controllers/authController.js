/**
 * @fileoverview Contrôleur d'authentification gérant l'inscription, la connexion, 
 * l'authentification à deux facteurs (2FA) et la vérification des codes d'enregistrement.
 * @module controllers/authController
 */

// filepath: /home/816ctbe/Documents/SPOC-LMSC/server/controllers/authController.js
const { User, Code, StudentClass } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');

/**
 * Messages d'erreur utilisés dans le contrôleur d'authentification
 * @constant {Object}
 */
const ERROR_MESSAGES = {
  INVALID_2FA_CODE: 'auth/invalid-2fa-code',
  INVALID_REGISTER_CODE: 'auth/invalid-register-code',
  EXPIRED_TOKEN: 'auth/session-expired',
  MISSING_2FA_CODE: 'auth/2fa-required',
  MISSING_FIELDS: 'auth/missing-fields',
  INVALID_ROLE: 'auth/invalid-role',
  EMAIL_EXISTS: 'auth/email-exists',
  USERNAME_EXISTS: 'auth/username-exists',
  INVALID_CREDENTIALS: 'auth/invalid-credentials',
  SERVER_ERROR: 'default'
};

/**
 * Génère un token temporaire pour l'authentification à deux facteurs
 * 
 * @param {number} userId - Identifiant de l'utilisateur
 * @param {boolean} isSetup - Indique si le token est utilisé pour la configuration 2FA
 * @returns {string} Token JWT temporaire
 * 
 * @example
 * const tempToken = generateTempToken(123, true); // Pour configuration 2FA
 * const tempToken = generateTempToken(123, false); // Pour vérification 2FA
 */
const generateTempToken = (userId, isSetup) => {
  return jwt.sign(
    { userId, purpose: isSetup ? 'Setup2FA' : '2FA' },
    process.env.JWT_SECRET,
    { expiresIn: isSetup ? '2m' : '10m', algorithm: 'HS256' }
  );
};

/**
 * Vérifie la validité d'un code d'enregistrement
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function|null} next - Middleware suivant
 * @param {boolean} internal - Indique si l'appel est interne ou non
 * @param {Object|null} registerCode - Code d'enregistrement en cas d'appel interne
 * @returns {Object|undefined} Retourne un objet avec isValid si internal est true, sinon répond via res
 * @throws {Error} En cas d'erreur serveur
 */
const checkRegisterCode = async (req, res, next = null, internal = false, registerCode = null) => {
  const code = registerCode?.code || req.body?.code;

  if (!code) {
    return internal ? { isValid: false } : res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  try {
    const codeRecord = await Code.findOne({ where: { value: code } });

    if (!codeRecord) {
      return internal ? { isValid: false } : res.status(400).json({ message: ERROR_MESSAGES.INVALID_REGISTER_CODE });
    }

    if (new Date() > codeRecord.expiresAt) {
      return internal ? { isValid: false } : res.status(400).json({ message: ERROR_MESSAGES.INVALID_REGISTER_CODE });
    }

    if (codeRecord.remainingUses <= 0) {
      return internal ? { isValid: false } : res.status(400).json({ message: ERROR_MESSAGES.INVALID_REGISTER_CODE });
    }

    return internal ? { isValid: true } : res.json({ isValid: true });
  } catch (error) {
    console.error('Error checking register code:', error);
    return internal ? { isValid: false } : res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
}

/**
 * Inscrit un nouvel utilisateur
 * 
 * @param {Object} req - Requête Express contenant les informations d'inscription
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.username - Nom d'utilisateur
 * @param {string} req.body.registerCode - Code d'enregistrement
 * @param {string} req.body.password - Mot de passe
 * @param {string} req.body.name - Prénom
 * @param {string} req.body.surname - Nom de famille
 * @param {Object} res - Réponse Express
 * @returns {Object} Retourne un token temporaire et les informations de configuration 2FA
 * @throws {Error} En cas d'erreur d'inscription
 */
const register = async (req, res) => {
  const { email, username, registerCode, password, name, surname } = req.body;
  const requiredFields = ['email', 'username', 'registerCode', 'password', 'name', 'surname'];

  if (requiredFields.some(field => !req.body[field])) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  const registerCodeCheck = await checkRegisterCode(req, res, null, true, { code: registerCode });
  if (!registerCodeCheck.isValid) {
    return res.status(400).json({ message: ERROR_MESSAGES.INVALID_REGISTER_CODE });
  }

  const codeRecord = await Code.findOne({ where: { value: registerCode } });
  if (codeRecord) {
    codeRecord.remainingUses -= 1;
    await codeRecord.save();
  }

  const { role, classId } = codeRecord;

  try {
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { username } })
    ]);

    if (existingEmail) return res.status(409).json({ message: ERROR_MESSAGES.EMAIL_EXISTS });
    if (existingUsername) return res.status(409).json({ message: ERROR_MESSAGES.USERNAME_EXISTS });

    const hashedPassword = await bcrypt.hash(password, 12);
    const secret = authenticator.generateSecret();

    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      name,
      surname,
      firstLogin: false,
      twoFASecret: secret,
      twoFAEnabled: false,
      role
    });

    if (classId) {
      await StudentClass.create({ student_id: newUser.id, class_id: classId });
    }

    const qrCode = await qrcode.toDataURL(authenticator.keyuri(email, process.env.APP_NAME, secret));
    const tempToken = generateTempToken(newUser.id, true);

    return res.status(201).json({
      tempToken,
      twoFASetup: {
        qrCode,
        manualSecret: secret
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Inscrit manuellement un utilisateur (généralement utilisé par les administrateurs)
 * 
 * @param {Object} req - Requête Express
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.password - Mot de passe
 * @param {string} req.body.role - Rôle de l'utilisateur
 * @param {string} req.body.name - Prénom
 * @param {string} req.body.surname - Nom de famille
 * @param {Object} res - Réponse Express
 * @returns {Object} Retourne un token JWT
 * @throws {Error} En cas d'erreur d'inscription
 */
const manualRegister = async (req, res) => {
  const { email, password, role, name, surname } = req.body;
  const requiredFields = ['email', 'password', 'role', 'name', 'surname'];

  if (requiredFields.some(field => !req.body[field])) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  try {
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ where: { email } }),
    ]);

    if (existingEmail) return res.status(409).json({ message: ERROR_MESSAGES.EMAIL_EXISTS });

    const hashedPassword = await bcrypt.hash(password, 12);


    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      surname,
      firstLogin: true,
      twoFAEnabled: false,
      role
    });

    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role // Toujours en français
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Authentifie un utilisateur existant
 * 
 * @param {Object} req - Requête Express
 * @param {string} [req.body.email] - Email de l'utilisateur (optionnel si username est fourni)
 * @param {string} [req.body.username] - Nom d'utilisateur (optionnel si email est fourni)
 * @param {string} req.body.password - Mot de passe
 * @param {Object} res - Réponse Express
 * @returns {Object} Retourne un token JWT ou un token temporaire si 2FA est activé
 * @throws {Error} En cas d'erreur d'authentification
 */
const login = async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else {
      user = await User.findOne({ where: { username } });
    }
    if (!user) return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const isAccountLocked = user.statut === 'inactif';
    if (isAccountLocked) {
      return res.status(403).json({ message: 'Account is locked. Please contact support using contact form.' });
    }

    if (user.twoFAEnabled) {
      const tempToken = generateTempToken(user.id);
      return res.status(202).json({
        requires2FA: true,
        tempToken,
        message: '2FA required'
      });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role, // Toujours en français
      ...(user.firstLogin && { firstLogin: true })
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: user.firstLogin ? '10m' : '1h' });
    return res.json({ token });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Vérifie un code d'authentification à deux facteurs
 * 
 * @param {Object} req - Requête Express
 * @param {string} req.body.code - Code 2FA
 * @param {string} req.body.tempToken - Token temporaire
 * @param {boolean} [req.body.setup] - Indique si c'est pour la configuration initiale
 * @param {Object} res - Réponse Express
 * @returns {Object} Retourne un token JWT
 * @throws {Error} En cas d'erreur de vérification
 */
const verify2FA = async (req, res) => {
  const { code, tempToken, setup } = req.body;

  if (!code || !tempToken) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_2FA_CODE });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.purpose !== '2FA' && decoded.purpose !== 'Setup2FA') {
      return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const verified = authenticator.check(code, user.twoFASecret);
    if (!verified) return res.status(401).json({ message: ERROR_MESSAGES.INVALID_2FA_CODE });

    if (setup) {
      user.twoFAEnabled = true;
      await user.save();
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role, // Toujours en français
      ...(user.firstLogin && { firstLogin: true })
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: ERROR_MESSAGES.EXPIRED_TOKEN });
    }
    console.error('2FA verification error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Active l'authentification à deux facteurs pour un utilisateur
 * 
 * @param {Object} req - Requête Express
 * @param {Object} req.user - Utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} res - Réponse Express
 * @returns {Object} Retourne un token temporaire et les informations de configuration 2FA
 * @throws {Error} En cas d'erreur d'activation
 */
const activate2FA = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    const email = user.email;
    const secret = authenticator.generateSecret();
    user.twoFASecret = secret;

    await user.save();

    const qrCode = await qrcode.toDataURL(authenticator.keyuri(email, process.env.APP_NAME, secret));
    const tempToken = generateTempToken(user.id, true);

    return res.status(201).json({
      tempToken,
      twoFASetup: {
        qrCode,
        manualSecret: secret
      }
    });

  } catch (error) {
    console.error('Erreur activation 2FA:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Rafraîchit la configuration de l'authentification à deux facteurs
 * 
 * @param {Object} req - Requête Express
 * @param {string} req.body.tempToken - Token temporaire
 * @param {Object} res - Réponse Express
 * @returns {Object} Retourne un nouveau token temporaire
 * @throws {Error} En cas d'erreur de rafraîchissement
 */
const refresh2FASetup = async (req, res) => {
  const { tempToken } = req.body;

  if (!tempToken) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'Setup2FA') {
      return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const newTempToken = generateTempToken(user.id, true);
    return res.status(201).json({ tempToken: newTempToken });

  } catch (error) {
    console.error('2FA refresh error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Gère la première connexion d'un utilisateur avec mise à jour des informations et configuration 2FA
 * 
 * @param {Object} req - Requête Express
 * @param {string} req.body.username - Nouveau nom d'utilisateur
 * @param {string} req.body.password - Nouveau mot de passe
 * @param {Object} req.user - Utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} res - Réponse Express
 * @returns {Object} Retourne un token JWT ou des informations de configuration 2FA
 * @throws {Error} En cas d'erreur de configuration
 */
const firstLogin = async (req, res) => {
  const { username, password } = req.body;
  const userId = req.user.id;

  if (!password || !username) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    if (!user.firstLogin) {
      return res.status(400).json({ message: 'User has already completed first login.' });
    }

    const existingUsername = await User.findOne({ where: { username, id: { [Op.ne]: userId } } });
    if (existingUsername) {
      return res.status(409).json({ message: ERROR_MESSAGES.USERNAME_EXISTS });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    user.firstLogin = false;
    user.password = hashedPassword;
    user.username = username;

    if (user.twoFAEnabled) {
      await user.save();
      
      const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token });
    }

    const email = user.email;
    const secret = authenticator.generateSecret();
    user.twoFASecret = secret;

    await user.save();

    const qrCode = await qrcode.toDataURL(authenticator.keyuri(email, process.env.APP_NAME, secret));
    const tempToken = generateTempToken(user.id, true);

    return res.status(200).json({
      tempToken,
      twoFASetup: {
        qrCode,
        manualSecret: secret
      }
    });

  } catch (error) {
    console.error('First login error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

module.exports = {
  manualRegister,
  register,
  login,
  activate2FA,
  verify2FA,
  refresh2FASetup,
  checkRegisterCode,
  firstLogin
};