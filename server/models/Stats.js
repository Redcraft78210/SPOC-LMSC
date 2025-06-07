/**
 * @fileoverview Modèle Sequelize pour la gestion des statistiques des étudiants dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour stocker et suivre les statistiques d'apprentissage
 * des étudiants, incluant les cours complétés et les sessions en direct suivies.
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

/**
 * Modèle Sequelize représentant les statistiques d'un étudiant dans le système éducatif.
 * Ce modèle permet de suivre les progrès et performances d'apprentissage des étudiants.
 * 
 * @class Stats
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID des statistiques (clé primaire, généré automatiquement)
 * @property {string} studentId - UUID de l'étudiant associé (obligatoire, référence vers la table users)
 * @property {number} totalCoursesCompleted - Nombre total de cours complétés par l'étudiant (par défaut: 0, minimum: 0)
 * @property {number} totalLivesAttended - Nombre total de sessions en direct suivies par l'étudiant (par défaut: 0, minimum: 0)
 * @property {Date} createdAt - Date et heure de création des statistiques (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création de nouvelles statistiques pour un étudiant
 * const nouvellesStats = await Stats.create({
 *   studentId: '550e8400-e29b-41d4-a716-446655440000',
 *   totalCoursesCompleted: 5,
 *   totalLivesAttended: 3
 * });
 * 
 * @example
 * // Récupération des statistiques d'un étudiant
 * const statsEtudiant = await Stats.findOne({
 *   where: { studentId: '550e8400-e29b-41d4-a716-446655440000' }
 * });
 * 
 * @example
 * // Mise à jour des statistiques après complétion d'un cours
 * await statsEtudiant.update({
 *   totalCoursesCompleted: statsEtudiant.totalCoursesCompleted + 1
 * });
 */
const Stats = sequelize.define('Stats', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  totalCoursesCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  totalLivesAttended: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'student_stats',
  timestamps: true,
});

module.exports = Stats;