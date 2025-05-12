import express from 'express';
import liveValidation from '../middlewares/liveValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
    getLive,
    getAllLives,
    getLiveByClass,
    addLive,
    editLive,
    deleteLive,
} from '../controllers/liveController.js';

const router = express.Router();

// Get all lives
router.get('/all', authMiddleware, getAllLives);

// Get live by id
router.get('/:id', authMiddleware, getLive);

// Add a new live if pass validation middleware and auth middleware
router.post('/', authMiddleware, liveValidation.liveValidationRules(), liveValidation.validate, addLive);

// Edit an existing live
router.put('/:id', authMiddleware, editLive);

// Delete an existing live
router.delete('/:id', authMiddleware, deleteLive);

// Get live by student id and student class
router.get('/class/:classId', authMiddleware, getLiveByClass);

export default router;

