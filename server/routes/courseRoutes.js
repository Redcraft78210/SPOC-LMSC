/**
 * @fileoverview Routes pour la gestion des cours dans l'application SPOC-LMSC.
 * Définit les endpoints pour les opérations CRUD sur les cours avec authentification requise.
 */

const express = require('express');
const {
    getAllCourses, getCourse, getMainCourse, deleteCourse, updateCourse, createCourse, blockCourse, unblockCourse
} = require('../controllers/courseController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Middleware d'authentification appliqué à toutes les routes de cours
 */
router.use(authMiddleware);

/**
 * Route pour récupérer tous les cours
 * @route GET /all
 */
router.get('/all', getAllCourses);

/**
 * Route pour récupérer un cours spécifique par son ID
 * @route GET /:id
 * @param {string} id - ID du cours
 */
router.get('/:id', getCourse);

/**
 * Route pour récupérer les informations principales d'un cours
 * @route GET /:id/main
 * @param {string} id - ID du cours
 */
router.get('/:id/main', getMainCourse);

/**
 * Route pour créer un nouveau cours
 * @route POST /create
 */
router.post('/create', createCourse);

/**
 * Route pour bloquer un cours
 * @route POST /:id/block
 * @param {string} id - ID du cours à bloquer
 */
router.post('/:id/block', blockCourse);

/**
 * Route pour mettre à jour un cours
 * @route PUT /update/:id
 * @param {string} id - ID du cours à mettre à jour
 */
router.put('/update/:id', updateCourse);

/**
 * Route pour débloquer un cours
 * @route PUT /:id/unblock
 * @param {string} id - ID du cours à débloquer
 */
router.put('/:id/unblock', unblockCourse);

/**
 * Route pour supprimer un cours
 * @route DELETE /:id
 * @param {string} id - ID du cours à supprimer
 */
router.delete('/:id', deleteCourse);

module.exports = { route: router };