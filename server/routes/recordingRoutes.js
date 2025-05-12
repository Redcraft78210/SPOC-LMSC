const express = require('express');
const router = express.Router();
const { startRecording, stopRecording, getRecordingStatus } = require('../controllers/recordingController');
const authMiddleware = require('../middleware/authMiddleware');

// Recording routes
router.post('/record', authMiddleware, startRecording);
router.post('/stop-record', authMiddleware, stopRecording);
router.get('/record-status', authMiddleware, getRecordingStatus);

// Export default pour garder la cohérence avec vos autres fichiers de route
exports.default = router;