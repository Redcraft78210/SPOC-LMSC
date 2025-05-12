import express from 'express';
import { getVideo, uploadVideo, downloadVideo, deleteVideo } from '../controllers/videoController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const allowedReferrerStarts = ['https://localhost:5173', 'https://localhost:8443'];

// Get video by ID
router.get('/:id', authMiddleware, (req, res, next) => {
  const referrer = req.get('Referrer');
  if (!referrer || !allowedReferrerStarts.some(start => referrer.startsWith(start))) {
    return res.status(403).send('Forbidden');
  }
  next();
}, getVideo);

router.post('/', authMiddleware, uploadVideo);

router.get('/download/:id', authMiddleware, downloadVideo);

router.delete('/:id', authMiddleware, deleteVideo);

export default router;

