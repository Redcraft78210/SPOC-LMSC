import express from 'express';
import {
    getAllCourses, getCourse, getMainCourse, deleteCourse, updateCourse, createCourse
} from '../controllers/courseController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all', authMiddleware, getAllCourses);
router.get('/:id', authMiddleware, getCourse);
router.get('/:id/main', authMiddleware, getMainCourse);
router.post('/create', authMiddleware, createCourse);
router.put('/update/:id', authMiddleware, updateCourse);
router.delete('/delete/:id', authMiddleware, deleteCourse);

export default router;