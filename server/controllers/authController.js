const { Student, Teacher } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');


const ERROR_MESSAGES = {
  INVALID_2FA_CODE: 'auth/invalid-2fa-code',
  EXPIRED_TOKEN: 'auth/session-expired',
  MISSING_2FA_CODE: 'auth/2fa-required',
  MISSING_FIELDS: 'auth/missing-fields',
  INVALID_ROLE: 'auth/invalid-role',
  EMAIL_EXISTS: 'auth/email-exists',
  USERNAME_EXISTS: 'auth/username-exists',
  INVALID_CREDENTIALS: 'auth/invalid-credentials',
  SERVER_ERROR: 'default'
};

const generateTempToken = (userId, isSetup) => {
  return jwt.sign(
    { userId, purpose: isSetup ? 'Setup2FA' : '2FA' },
    process.env.JWT_SECRET,
    { expiresIn: isSetup ? '2m' : '10m', algorithm: 'HS256' }
  );
};

const register = async (req, res) => {
  const { email, username, password, name, surname, role = 'student' } = req.body;
  const requiredFields = ['email', 'username', 'password', 'name', 'surname'];

  if (requiredFields.some(field => !req.body[field])) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: ERROR_MESSAGES.INVALID_ROLE });
  }

  try {
    const [existingEmail, existingUsername] = await Promise.all([
      Student.findOne({ where: { email } }) || Teacher.findOne({ where: { email } }),
      Student.findOne({ where: { username } }) || Teacher.findOne({ where: { username } })
    ]);

    if (existingEmail) return res.status(409).json({ message: ERROR_MESSAGES.EMAIL_EXISTS });
    if (existingUsername) return res.status(409).json({ message: ERROR_MESSAGES.USERNAME_EXISTS });

    const hashedPassword = await bcrypt.hash(password, 12);
    const Model = role === 'student' ? Student : Teacher;

    const secret = authenticator.generateSecret();
    const twoFASecret = secret;

    const newUser = await Model.create({
      email,
      username,
      password: hashedPassword,
      name,
      surname,
      role,
      twoFASecret,
      twoFAEnabled: false
    });

    const qrCode = await qrcode.toDataURL(authenticator.keyuri(email, process.env.APP_NAME, secret));

    const tempToken = generateTempToken(newUser.id, 'setup');
    return res.status(201).json({
      tempToken,
      twoFASetup: {
        qrCode,
        manualSecret: twoFASecret
      }
    });

  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  try {
    const [student, teacher] = await Promise.all([
      Student.findOne({ where: { email } }),
      Teacher.findOne({ where: { email } })
    ]);

    const user = student || teacher;
    if (!user) return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    if (user.twoFAEnabled) {
      const tempToken = generateTempToken(user.id);
      return res.status(202).json({
        requires2FA: true,
        tempToken,
        message: '2FA requis'
      });
    }

    const tokenPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

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

    const user = await Student.findByPk(decoded.userId) || await Teacher.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const verified = authenticator.check(code, user.twoFASecret);

    if (!verified) {
      return res.status(401).json({ message: ERROR_MESSAGES.INVALID_2FA_CODE });
    }

    if (setup) {
      user.twoFAEnabled = true;
      await user.save();
    }

    const tokenPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: ERROR_MESSAGES.EXPIRED_TOKEN });
    }
    console.error('Erreur de vérification 2FA:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

const refresh2FASetup = async (req, res) => {
  const { tempToken, twoFASetup } = req.body;

  if (!tempToken) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (decoded.purpose !== 'Setup2FA') {
      return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    const user = await Student.findByPk(decoded.userId) || await Teacher.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const newTempToken = generateTempToken(user.id, 'setup');

    return res.json({
      tempToken: newTempToken,
      twoFASetup
    });
  } catch (error) {
    console.error('Erreur de réinitialisation 2FA:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

module.exports = {
  register,
  login,
  verify2FA,
  refresh2FASetup
};

