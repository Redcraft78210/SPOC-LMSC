const express = require('express');
const { getAllCodes, createCode, deleteCode } = require('../controllers/codeController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.use(authMiddleware)

// GET all codes
router.get('/', getAllCodes);

// CREATE new code
router.post('/', createCode);

// DELETE code
router.delete('/:code', deleteCode);

module.exports = { route: router };