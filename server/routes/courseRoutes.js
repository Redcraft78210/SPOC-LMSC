const express = require('express');
const {
    getAllCourses, getCourse, getMainCourse, deleteCourse, updateCourse, createCourse
} = require('../controllers/courseController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/all', getAllCourses);
router.get('/:id', getCourse);
router.get('/:id/main', getMainCourse);
router.post('/create', createCourse);
router.put('/update/:id', updateCourse);
router.delete('/delete/:id', deleteCourse);

module.exports = { route: router };