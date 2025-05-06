import express from 'express';
import { record } from '../controllers/cameraController.js';

const router = express.Router();

const allowedReferrerStarts = ['https://localhost:5173', 'https://localhost:8443'];

// Middleware to filter referrer
router.use((req, res, next) => {
  const referrer = req.get('Referrer');
  if (!referrer || !allowedReferrerStarts.some(start => referrer.startsWith(start))) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Record video
router.get('/record', record);

export default router;

