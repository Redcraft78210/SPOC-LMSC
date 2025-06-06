const express = require('express');
const { getVideo, getVideoInfo, uploadVideo, downloadVideo, deleteVideo } = require('../controllers/videoController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

const allowedReferrerStarts = ['https://spoc.lmsc'];

// Get video by ID
router.get('/:id', (req, res, next) => {
  const referrer = req.get('Referrer');
  if (!referrer || !allowedReferrerStarts.some(start => referrer.startsWith(start))) {
    return res.status(403).send('Forbidden');
  }
  next();
}, getVideo);

// Get video information by ID
router.get('/info/:id', (req, res, next) => {
  const referrer = req.get('Referrer');
  if (!referrer || !allowedReferrerStarts.some(start => referrer.startsWith(start))) {
    return res.status(403).send('Forbidden');
  }
  next();
}, getVideoInfo);

router.use(authMiddleware);

router.post('/', uploadVideo);

router.get('/download/:id', downloadVideo);

router.delete('/:id', deleteVideo);

module.exports = { route: router };
