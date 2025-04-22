import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getVideo } from '../controllers/videoController.js';


const router = express.Router();

// Get all videos
router.get('/:id', authMiddleware, getVideo);

export default router;

