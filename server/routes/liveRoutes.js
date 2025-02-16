import express from 'express';
import liveValidation from '../middlewares/liveValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import liveController from '../controllers/liveController.js';

const router = express.Router();

// Get all lives
router.get('/', authMiddleware, liveController.getAllLives);

// Add a new live if pass validation middleware and auth middleware
router.post('/', authMiddleware, liveValidation.liveValidationRules(), liveValidation.validate, liveController.addLive);

// Edit an existing live
router.put('/:id', authMiddleware, liveController.editLive);

// Delete an existing live
router.delete('/:id', authMiddleware, liveController.deleteLive);

// Get live by student id and student class
router.get('/class/:classId', authMiddleware, liveController.getLiveByClass);

export default router;

