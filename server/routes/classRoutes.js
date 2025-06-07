/**
 * @fileoverview Routes pour la gestion des classes dans l'application.
 * Définit les endpoints REST pour les opérations CRUD sur les classes.
 * Toutes les routes sont protégées par le middleware d'authentification.
 * @module routes/classRoutes
 */

const {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
} = require('../controllers/classController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const { Router } = require('express');

const router = Router();

/**
 * Applique le middleware d'authentification à toutes les routes de ce router.
 * Toutes les requêtes doivent être authentifiées pour accéder aux endpoints des classes.
 */
router.use(authMiddleware);

/**
 * @route GET /
 * @description Récupère toutes les classes avec leurs étudiants associés
 * @access Private (authentification requise)
 * @returns {Array<Object>} Liste de toutes les classes avec le nombre d'étudiants
 */
router.get('/', getAllClasses);

/**
 * @route GET /:id
 * @description Récupère une classe spécifique par son ID
 * @access Private (authentification requise)
 * @param {string} id - L'ID de la classe à récupérer
 * @returns {Object} Les données de la classe demandée
 */
router.get('/:id', getClassById);

/**
 * @route POST /
 * @description Crée une nouvelle classe
 * @access Private (authentification requise)
 * @param {Object} body - Les données de la classe à créer
 * @param {string} body.name - Le nom de la classe (obligatoire)
 * @param {string} [body.description] - La description de la classe
 * @param {number} body.main_teacher_id - L'ID de l'enseignant principal (obligatoire)
 * @param {Array<number>} [body.students] - Liste des IDs des étudiants à associer
 * @returns {Object} Message de confirmation de création
 */
router.post('/', createClass);

/**
 * @route PUT /:id
 * @description Met à jour une classe existante
 * @access Private (authentification requise)
 * @param {string} id - L'ID de la classe à mettre à jour
 * @param {Object} body - Les nouvelles données de la classe
 * @param {string} [body.name] - Le nouveau nom de la classe
 * @param {string} [body.description] - La nouvelle description de la classe
 * @param {number} [body.main_teacher_id] - Le nouvel ID de l'enseignant principal
 * @param {Array<number>} [body.students] - Nouvelle liste des IDs des étudiants
 * @returns {Object} Les données de la classe mise à jour
 */
router.put('/:id', updateClass);

/**
 * @route DELETE /:id
 * @description Supprime une classe existante
 * @access Private (authentification requise)
 * @param {string} id - L'ID de la classe à supprimer
 * @returns {void} Statut 204 si la suppression est réussie
 */
router.delete('/:id', deleteClass);

/**
 * Exporte le router configuré pour les routes des classes.
 * @type {Object}
 * @property {Router} route - Le router Express configuré avec toutes les routes des classes
 */
module.exports = { route: router };
