// controllers/codeController.js
const Code = require('../models/Code.js');

// GET all codes
async function getAllCodes(req, res) {
  try {
    const codes = await Code.findAll();
    res.json(codes);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// CREATE new code
async function createCode(req, res) {
  const { role, classId, usageLimit, validityPeriod } = req.body;

  const newCode = new Code({
    value: generateRandomCode(),
    role,
    classId,
    usageLimit,
    remainingUses: usageLimit,
    expiresAt: new Date(Date.now() + validityPeriod * 60 * 60 * 1000)
  });

  try {
    const savedCode = await newCode.save();
    res.status(201).json(savedCode);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad request' });
  }
}

// DELETE code
async function deleteCode(req, res) {
  try {
    const code = await Code.findOne({ where: { value: req.params.code } });
    if (!code) {
      return res.status(404).json({ message: 'Code non trouvé' });
    }

    await code.destroy();
    res.json({ message: 'Code supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function generateRandomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

module.exports = {
  getAllCodes,
  createCode,
  deleteCode
};
