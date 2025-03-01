import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import liveMiddleware from '../middlewares/liveMiddleware.js';
import { displayStream } from '../middlewares/streamMiddleware.js';
const router = express.Router();


router.get('/:liveid', authMiddleware, liveMiddleware, displayStream);

export default router;