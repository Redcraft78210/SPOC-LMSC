const { CourseProgress, Course, LiveAttendance, User, Lives, sequelize } = require('../models');

/**
 * Progress tracking controller for managing student progress in courses and Lives session attendance
 */

/**
 * Get course progress for a specific user
 */
const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }
        const progress = await CourseProgress.findOne({
            where: { user_id: userId, course_id: courseId },
        });
        if (!progress) {
            return res.status(404).json({ message: 'No progress found for this course' });
        }
        return res.status(200).json(progress);
    } catch (error) {
        console.error('Error fetching user course progress:', error);
        return res.status(500).json({ message: 'Failed to fetch course progress' });
    }
};

/**
 * Get progress for a specific course
 */
const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;

        const progress = await CourseProgress.findAll({
            where: { course_id: courseId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'surname', 'username']
                }
            ]
        });

        return res.status(200).json(progress);
    } catch (error) {
        console.error('Error fetching course progress:', error);
        return res.status(500).json({ message: 'Failed to fetch course progress' });
    }
};

/**
 * Update or create course progress entry
 */
const updateCourseProgress = async (req, res) => {
    try {
        const { status } = req.body;
        const courseId = req.params.courseId;
        const userId = req.params.userId || req.user.id;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        if (!['not_started', 'in_progress', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Check if the course exists
        const course = await Course.findOne({ where: { id: courseId } });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if the user exists
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!['not_started', 'in_progress', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        if (status === 'in_progress') {
            const completed = await CourseProgress.findOne({
                where: {
                    user_id: userId,
                    course_id: courseId,
                    status: 'completed'
                }
            });
            if (completed) {
                return res.status(400).json({ message: 'Cannot mark as in progress, already completed' });
            }
        }

        const [progress, created] = await CourseProgress.findOrCreate({
            where: {
                user_id: userId,
                course_id: courseId
            },
            defaults: { status }
        });

        if (!created) {
            await progress.update({ status });
        }

        return res.status(200).json({
            message: created ? 'Course progress created' : 'Course progress updated',
            progress
        });
    } catch (error) {
        console.error('Error updating course progress:', error);
        return res.status(500).json({ message: 'Failed to update course progress' });
    }
};

/**
 * Get Lives session attendance for a user
 */
const getUserAttendance = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const attendance = await LiveAttendance.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Lives,
                    attributes: ['id', 'title', 'description', 'link']
                }
            ]
        });

        return res.status(200).json(attendance);
    } catch (error) {
        console.error('Error fetching user attendance:', error);
        return res.status(500).json({ message: 'Failed to fetch attendance records' });
    }
};

/**
 * Update or mark Lives session attendance
 */
const markAttendance = async (req, res) => {
    try {
        const { userId, LivesId, status } = req.body;

        if (!['attended', 'missed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const [attendance, created] = await LiveAttendance.findOrCreate({
            where: {
                user_id: userId,
                Lives_id: LivesId
            },
            defaults: { status }
        });

        if (!created) {
            await attendance.update({ status });
        }

        return res.status(200).json({
            message: created ? 'Attendance record created' : 'Attendance record updated',
            attendance
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
        return res.status(500).json({ message: 'Failed to update attendance' });
    }
};

/**
 * Get attendance statistics for a Lives session
 */
const getLiveAttendanceStats = async (req, res) => {
    try {
        const { LivesId } = req.params;

        const attendanceStats = await LiveAttendance.findAll({
            where: { Lives_id: LivesId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'surname', 'username']
                }
            ],
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('status')), 'count']
            ],
            group: ['status']
        });

        return res.status(200).json(attendanceStats);
    } catch (error) {
        console.error('Error fetching Lives attendance statistics:', error);
        return res.status(500).json({ message: 'Failed to fetch attendance statistics' });
    }
};

/**
 * Get user statistics including course progress and Lives attendance
 */
const getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const completedCourses = await CourseProgress.count({
            where: { user_id: userId, status: 'completed' },
        });

        const liveSessions = await LiveAttendance.count({
            where: { user_id: userId, status: 'attended' }
        });

        return res.status(200).json({
            completedCourses,
            liveSessions
        });
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        return res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
};

module.exports = {
    getUserCourseProgress,
    getCourseProgress,
    updateCourseProgress,
    getUserAttendance,
    markAttendance,
    getLiveAttendanceStats,
    getUserStats
};
