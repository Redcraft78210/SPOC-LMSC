const express = require('express');
const router = express.Router();
const { startRecording, stopRecording, getRecordingStatus } = require('../controllers/recordingController');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware);

// Recording routes
router.post('/record', startRecording);
router.post('/stop-record', stopRecording);
router.get('/record-status', getRecordingStatus);

module.exports = { route: router };