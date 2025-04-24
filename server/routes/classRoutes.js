import {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
} from '../controllers/classController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

import { Router } from 'express';

const router = Router();

router.use(authMiddleware);

// Get all classes
router.get('/', getAllClasses);

// Get a class by its ID
router.get('/:id', getClassById);

// Create a new class
router.post('/', createClass);

// Update a class
router.put('/:id', updateClass);

// Delete a class
router.delete('/:id', deleteClass);

export default router;
