const express = require('express');
const router = express.Router();
const { getUserCourseProgress,
    getCourseProgress,
    updateCourseProgress,
    getUserAttendance,
    markAttendance,
    getLiveAttendanceStats,
    getUserStats } = require('../controllers/progressTracking.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware);

/**
 * Course Progress Routes
 */
// Get course progress for logged in user
router.get('/course-progress/:courseId', getUserCourseProgress);
// Get course progress for a specific user
router.get('/course-progress/user/:userId', getUserCourseProgress);
// Get all progress entries for a specific course
router.get('/course-progress/course/:courseId', getCourseProgress);
// Create or update course progress
router.post('/course-progress/:courseId', updateCourseProgress);

/**
 * Lives Attendance Routes
 */
// Get attendance records for logged in user
router.get('/attendance', getUserAttendance);
// Get attendance records for a specific user
router.get('/attendance/user/:userId', getUserAttendance);
// Get attendance statistics for a specific Lives session
router.get('/attendance/lives/:LivesId', getLiveAttendanceStats);
// Mark attendance for a Lives session
router.post('/attendance', markAttendance);

/**
 * User Statistics Routes
 */
// Get statistics for logged in user
router.get('/stats', getUserStats);
// Get statistics for a specific user
router.get('/stats/user/:userId', getUserStats);

module.exports = { route: router };