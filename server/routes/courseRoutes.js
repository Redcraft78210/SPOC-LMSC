const express = require('express');
const {
    getAllCourses, getCourse, getMainCourse, deleteCourse, updateCourse, createCourse, blockCourse, unblockCourse
} = require('../controllers/courseController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/all', getAllCourses);
router.get('/:id', getCourse);
router.get('/:id/main', getMainCourse);
router.post('/create', createCourse);
router.post('/:id/block', blockCourse);
router.put('/update/:id', updateCourse);
router.put('/:id/unblock', unblockCourse);
router.delete('/:id', deleteCourse);

module.exports = { route: router };