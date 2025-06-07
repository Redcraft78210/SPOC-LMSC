/**
 * @fileoverview Contrôleur de suivi de progression pour gérer le progrès des étudiants dans les cours et la présence aux sessions Lives.
 * @module controllers/progressTracking
 */

const { CourseProgress, Course, LiveAttendance, User, Lives, sequelize } = require('../models');

/**
 * Récupère la progression d'un cours pour un utilisateur spécifique
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.user - Utilisateur authentifié
 * @param {string} req.user.id - ID de l'utilisateur authentifié
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.courseId - ID du cours dont on veut récupérer la progression
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<Object>} Objet JSON contenant la progression du cours ou un message d'erreur
 * @throws {Error} Erreur lors de la récupération de la progression
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
 * Récupère la progression de tous les utilisateurs pour un cours spécifique
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.courseId - ID du cours dont on veut récupérer les progressions
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<Object>} Tableau JSON contenant les progressions du cours pour tous les utilisateurs
 * @throws {Error} Erreur lors de la récupération des progressions
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
 * Met à jour ou crée une entrée de progression pour un cours
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.status - Statut de progression ('not_started', 'in_progress', 'completed')
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.courseId - ID du cours à mettre à jour
 * @param {string} [req.params.userId] - ID de l'utilisateur (optionnel, utilise req.user.id par défaut)
 * @param {Object} req.user - Utilisateur authentifié
 * @param {string} req.user.id - ID de l'utilisateur authentifié
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<Object>} Objet JSON avec un message de confirmation et la progression mise à jour
 * @throws {Error} Erreur lors de la mise à jour de la progression
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


        const course = await Course.findOne({ where: { id: courseId } });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }


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
 * Récupère les enregistrements de présence aux sessions Lives pour un utilisateur
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} [req.params.userId] - ID de l'utilisateur (optionnel, utilise req.user.id par défaut)
 * @param {Object} req.user - Utilisateur authentifié
 * @param {string} req.user.id - ID de l'utilisateur authentifié
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<Object>} Tableau JSON contenant les enregistrements de présence avec les détails des sessions Lives
 * @throws {Error} Erreur lors de la récupération des enregistrements de présence
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
 * Marque ou met à jour la présence d'un utilisateur à une session Lives
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.userId - ID de l'utilisateur
 * @param {string} req.body.LivesId - ID de la session Lives
 * @param {string} req.body.status - Statut de présence ('attended', 'missed')
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<Object>} Objet JSON avec un message de confirmation et l'enregistrement de présence
 * @throws {Error} Erreur lors de la mise à jour de l'enregistrement de présence
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
 * Récupère les statistiques de présence pour une session Lives spécifique
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.LivesId - ID de la session Lives
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<Object>} Objet JSON contenant les statistiques de présence groupées par statut
 * @throws {Error} Erreur lors de la récupération des statistiques
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
 * Récupère les statistiques globales d'un utilisateur
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} [req.params.userId] - ID de l'utilisateur (optionnel, utilise req.user.id par défaut)
 * @param {Object} req.user - Utilisateur authentifié
 * @param {string} req.user.id - ID de l'utilisateur authentifié
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<Object>} Objet JSON contenant le nombre de cours complétés, commencés et de sessions Lives suivies
 * @throws {Error} Erreur lors de la récupération des statistiques
 */
const getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const completedCourses = await CourseProgress.count({
            where: { user_id: userId, status: 'completed' },
        });

        const startedCourses = await CourseProgress.count({
            where: { user_id: userId, status: 'in_progress' },
        });

        const liveSessions = await LiveAttendance.count({
            where: { user_id: userId, status: 'attended' }
        });

        return res.status(200).json({
            completedCourses,
            startedCourses,
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
