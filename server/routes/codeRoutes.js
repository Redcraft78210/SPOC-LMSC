// routes/codes.js
import express from 'express';
import { getAllCodes, createCode, deleteCode } from '../controllers/codeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware)

// GET all codes
router.get('/', getAllCodes);

// CREATE new code
router.post('/', createCode);

// DELETE code
router.delete('/:code', deleteCode);

export default router;
