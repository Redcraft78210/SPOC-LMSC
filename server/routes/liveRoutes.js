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

module.exports = { route: router };
