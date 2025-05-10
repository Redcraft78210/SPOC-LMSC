const express = require('express');
const router = express.Router();
const { startRecording, stopRecording, getRecordingStatus } = require('../controllers/recordingController');

// Recording routes
router.post('/record', startRecording);
router.post('/stop-record', stopRecording);
router.get('/record-status', getRecordingStatus);

// Export default pour garder la cohérence avec vos autres fichiers de route
exports.default = router;