/**
 * @fileoverview Modèle Sequelize pour la gestion des associations entre enseignants et classes.
 * Ce module définit la table de liaison many-to-many entre les enseignants et les classes,
 * permettant d'associer plusieurs enseignants à une classe et vice versa.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Classe = require('./Classe');

/**
 * Modèle Sequelize représentant l'association entre un enseignant et une classe.
 * Cette table de liaison permet de gérer les relations many-to-many entre les enseignants
 * et les classes, facilitant l'assignation d'enseignants à plusieurs classes.
 * 
 * @class TeacherClass
 * @extends {Sequelize.Model}
 * 
 * @property {string} teacher_id - UUID de l'enseignant associé (clé primaire composite, référence vers la table users)
 * @property {string} class_id - UUID de la classe associée (clé primaire composite, référence vers la table classes)
 * 
 * @example
 * // Association d'un enseignant à une classe
 * const association = await TeacherClass.create({
 *   teacher_id: '550e8400-e29b-41d4-a716-446655440000',
 *   class_id: '660e8400-e29b-41d4-a716-446655440001'
 * });
 * 
 * @example
 * // Récupération de toutes les classes d'un enseignant
 * const classesEnseignant = await TeacherClass.findAll({
 *   where: { teacher_id: '550e8400-e29b-41d4-a716-446655440000' }
 * });
 * 
 * @example
 * // Récupération de tous les enseignants d'une classe
 * const enseignantsClasse = await TeacherClass.findAll({
 *   where: { class_id: '660e8400-e29b-41d4-a716-446655440001' }
 * });
 */
const TeacherClass = sequelize.define('TeacherClass', {
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Classe,
      key: 'id',
    },
  },
}, {
  tableName: 'teacher_classes',
  timestamps: false,
});

/**
 * Association many-to-many permettant aux enseignants d'accéder à leurs classes assignées.
 * Définit la relation bidirectionnelle entre Teacher et Classe via la table TeacherClass.
 */
Teacher.belongsToMany(Classe, {
  through: TeacherClass,
  foreignKey: 'teacher_id',
  otherKey: 'class_id',
});

/**
 * Association many-to-many permettant aux classes d'accéder à leurs enseignants assignés.
 * Définit la relation bidirectionnelle entre Classe et Teacher via la table TeacherClass.
 */
Classe.belongsToMany(Teacher, {
  through: TeacherClass,
  foreignKey: 'class_id',
  otherKey: 'teacher_id',
});

module.exports = TeacherClass;

