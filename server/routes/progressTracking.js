/**
 * @fileoverview Routes de suivi de progression pour gérer les endpoints liés au progrès des cours, à la présence aux sessions Lives et aux statistiques utilisateur.
 * @module routes/progressTracking
 */

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
 * @route GET /course-progress/:courseId
 * @description Récupère la progression d'un cours pour l'utilisateur authentifié
 * @param {string} courseId - ID du cours
 * @access Private
 */
router.get('/course-progress/:courseId', getUserCourseProgress);

/**
 * @route GET /course-progress/user/:userId
 * @description Récupère la progression d'un cours pour un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @access Private
 */
router.get('/course-progress/user/:userId', getUserCourseProgress);

/**
 * @route GET /course-progress/course/:courseId
 * @description Récupère toutes les progressions d'un cours spécifique
 * @param {string} courseId - ID du cours
 * @access Private
 */
router.get('/course-progress/course/:courseId', getCourseProgress);

/**
 * @route POST /course-progress/:courseId
 * @description Met à jour la progression d'un cours
 * @param {string} courseId - ID du cours
 * @access Private
 */
router.post('/course-progress/:courseId', updateCourseProgress);

/**
 * @route GET /attendance
 * @description Récupère les enregistrements de présence pour l'utilisateur authentifié
 * @access Private
 */
router.get('/attendance', getUserAttendance);

/**
 * @route GET /attendance/user/:userId
 * @description Récupère les enregistrements de présence pour un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @access Private
 */
router.get('/attendance/user/:userId', getUserAttendance);

/**
 * @route GET /attendance/lives/:LivesId
 * @description Récupère les statistiques de présence pour une session Lives
 * @param {string} LivesId - ID de la session Lives
 * @access Private
 */
router.get('/attendance/lives/:LivesId', getLiveAttendanceStats);

/**
 * @route POST /attendance
 * @description Marque ou met à jour la présence à une session Lives
 * @access Private
 */
router.post('/attendance', markAttendance);

/**
 * @route GET /stats
 * @description Récupère les statistiques globales pour l'utilisateur authentifié
 * @access Private
 */
router.get('/stats', getUserStats);

/**
 * @route GET /stats/user/:userId
 * @description Récupère les statistiques globales pour un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @access Private
 */
router.get('/stats/user/:userId', getUserStats);

/**
 * @exports {Object} route - Router Express configuré avec toutes les routes de suivi de progression
 */
module.exports = { route: router };