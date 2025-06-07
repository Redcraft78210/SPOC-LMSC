/**
 * @fileoverview Modèle Sequelize pour la gestion des associations entre étudiants et classes.
 * Ce module définit la table de liaison many-to-many permettant d'associer des étudiants
 * à des classes dans le système éducatif SPOC-LMSC.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('../models/Student');
const Classe = require('../models/Classe');

/**
 * Modèle Sequelize représentant l'association entre un étudiant et une classe.
 * Cette table de liaison permet de gérer les inscriptions des étudiants dans les classes,
 * établissant une relation many-to-many entre les deux entités.
 * 
 * @class StudentClass
 * @extends {Sequelize.Model}
 * 
 * @property {string} student_id - UUID de l'étudiant inscrit (clé primaire composite, référence vers la table students)
 * @property {string} class_id - UUID de la classe d'inscription (clé primaire composite, référence vers la table classes)
 * 
 * @example
 * // Inscription d'un étudiant dans une classe
 * const inscription = await StudentClass.create({
 *   student_id: '550e8400-e29b-41d4-a716-446655440000',
 *   class_id: '660e8400-e29b-41d4-a716-446655440001'
 * });
 * 
 * @example
 * // Récupération de toutes les classes d'un étudiant
 * const classesEtudiant = await StudentClass.findAll({
 *   where: { student_id: '550e8400-e29b-41d4-a716-446655440000' }
 * });
 * 
 * @example
 * // Récupération de tous les étudiants d'une classe
 * const etudiantsClasse = await StudentClass.findAll({
 *   where: { class_id: '660e8400-e29b-41d4-a716-446655440001' }
 * });
 */
const StudentClass = sequelize.define('StudentClass', {
    student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Student,
            key: 'id'
        }
    },
    class_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Classe,
            key: 'id'
        }
    }
}, {
    tableName: 'student_classes',
    timestamps: false
});

module.exports = StudentClass;

