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

router.use(authMiddleware);

// Get all classes
router.get('/', getAllClasses);

// Get a class by its ID
router.get('/:id', getClassById);

// Create a new class
router.post('/', createClass);

// Update a class
router.put('/:id', updateClass);

// Delete a class
router.delete('/:id', deleteClass);

module.exports = { route: router };
