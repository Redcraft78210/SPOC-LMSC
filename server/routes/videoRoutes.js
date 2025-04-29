import express from 'express';
import { getVideo } from '../controllers/videoController.js';

const router = express.Router();

const allowedReferrerStarts = ['https://localhost:5173', 'https://localhost:8443'];

// Get video by ID
router.get('/:id', (req, res, next) => {
  const referrer = req.get('Referrer');
  if (!referrer || !allowedReferrerStarts.some(start => referrer.startsWith(start))) {
    return res.status(403).send('Forbidden');
  }
  next();
}, getVideo);

export default router;

