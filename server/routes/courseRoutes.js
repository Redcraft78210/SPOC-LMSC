import express from 'express';
import {
    getAllCours, getCours,
    getCoursMain, createCours, updateCours, deleteCours
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/all', getAllCours);
router.get('/:id', getCours);
router.get('/:id/main', getCoursMain);
router.post('/create', createCours);
router.put('/update/:id', updateCours);
router.delete('/delete/:id', deleteCours);

module.exports = router;