// server/routes/courseRoutes.js
import express from 'express';
import validateCourse from '../middlewares/courseValidation.js';
import courseController from '../controllers/courseController.js';

const router = express.Router();

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', validateCourse, courseController.createCourse); // Use validateCourse middleware
router.put('/:id', validateCourse, courseController.updateCourse); // Use validateCourse middleware
router.delete('/:id', courseController.deleteCourse);

export default router;