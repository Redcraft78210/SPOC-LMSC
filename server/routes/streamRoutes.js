import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const router = express.Router();

// Get all lives
router.get('/:liveid', authMiddleware,  );

export default router;

    