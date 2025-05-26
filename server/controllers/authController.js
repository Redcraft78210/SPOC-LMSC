const { User, Code, Classe, StudentClass } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');

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

const generateTempToken = (userId, isSetup) => {
  return jwt.sign(
    { userId, purpose: isSetup ? 'Setup2FA' : '2FA' },
    process.env.JWT_SECRET,
    { expiresIn: isSetup ? '2m' : '10m', algorithm: 'HS256' }
  );
};

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
      role: newUser.role === 'admin' ? 'Administrateur' : newUser.role === 'teacher' ? 'Professeur' : 'Etudiant'
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });

    const isAccountLocked = user.status === 'inactif';
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
      role: user.role === 'admin' ? 'Administrateur' :
        user.role === 'teacher' ? 'Professeur' :
          'Etudiant',
      ...(user.firstLogin && { firstLogin: true })
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: user.firstLogin ? '10m' : '1h' });
    return res.json({ token });

  } catch (error) {
    console.error('Login error:', error);
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
      role: user.role === 'admin' ? 'Administrateur' :
        user.role === 'teacher' ? 'Professeur' :
          'Etudiant',
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
    return res.json({ tempToken: newTempToken });

  } catch (error) {
    console.error('2FA refresh error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

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

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: ERROR_MESSAGES.USERNAME_EXISTS });
    }

    user.firstLogin = false;
    user.password = await bcrypt.hash(password, 12);
    user.username = username;

    // check if the user has 2FA enabled to direct login
    if (user.twoFAEnabled) {
      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role === 'admin' ? 'Administrateur' :
          user.role === 'teacher' ? 'Professeur' :
            'Etudiant',
        ...(user.firstLogin && { firstLogin: true })
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

    return res.status(201).json({
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