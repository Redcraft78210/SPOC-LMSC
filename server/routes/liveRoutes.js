const express = require('express');
const liveValidation = require('../middlewares/liveValidation.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const {
    getLive,
    getAllLives,
    getLiveByClass,
    addLive,
    editLive,
    deleteLive,
    startLive,
    endLive,
    blockLive,
    unblockLive,
    disapproveLive
} = require('../controllers/liveController.js');

const router = express.Router();

router.use(authMiddleware);


// Get all lives
router.get('/all', getAllLives);

// Get live by id
router.get('/:id', getLive);

// Add a new live if pass validation middleware and auth middleware
router.post('/', liveValidation.liveValidationRules(), liveValidation.validate, addLive);

// Edit an existing live
router.put('/:id', editLive);

// Delete an existing live
router.delete('/:id', deleteLive);

// Get live by student id and student class
router.get('/class/:classId', getLiveByClass);

// Start a live session
router.patch('/:id/start', startLive);

// End a live session
router.patch('/:id/end', endLive);


// Block a live session
router.patch('/:id/block', blockLive);

// Unblock a live session
router.patch('/:id/unblock', unblockLive);

// Disapprove a live session
router.patch('/:id/disapprove', disapproveLive);

module.exports = { route: router };
