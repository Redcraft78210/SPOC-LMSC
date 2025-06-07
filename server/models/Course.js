/**
 * @fileoverview
 * Modèle Sequelize pour la gestion des cours dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les cours pédagogiques,
 * incluant les informations de publication, les associations avec les enseignants
 * et la gestion des statuts de modération.
 */

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle Sequelize représentant un cours dans le système éducatif.
 * Un cours est créé par un enseignant et peut contenir des documents,
 * des vidéos et être associé à des étudiants.
 * 
 * @class Course
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID du cours (clé primaire)
 * @property {string} title - Titre du cours (obligatoire)
 * @property {string|null} description - Description détaillée du cours (optionnel)
 * @property {boolean} is_published - Indique si le cours est publié (par défaut: false)
 * @property {string} teacher_id - UUID de l'enseignant créateur (référence vers la table users)
 * @property {string|null} matiere - Matière/discipline du cours (optionnel)
 * @property {string|null} chapitre - Chapitre ou section du cours (optionnel)
 * @property {('draft'|'published'|'archived'|'blocked')} status - Statut du cours (par défaut: 'draft')
 * @property {string|null} block_reason - Raison du blocage si le cours est bloqué (optionnel)
 * 
 * @example
 * // Création d'un nouveau cours
 * const nouveauCours = await Course.create({
 *   title: 'Introduction à JavaScript',
 *   description: 'Cours d\'initiation au langage JavaScript',
 *   teacher_id: '550e8400-e29b-41d4-a716-446655440000',
 *   matiere: 'Informatique',
 *   chapitre: 'Programmation Web',
 *   is_published: true,
 *   status: 'published'
 * });
 * 
 * @example
 * // Recherche de cours par enseignant
 * const coursEnseignant = await Course.findAll({
 *   where: { teacher_id: '550e8400-e29b-41d4-a716-446655440000' }
 * });
 * 
 * @example
 * // Mise à jour du statut d'un cours
 * await cours.update({
 *   status: 'blocked',
 *   block_reason: 'Contenu inapproprié'
 * });
 */
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {  
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true  
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',  
      key: 'id'
    }
  },
  matiere: {
    type: DataTypes.STRING,
    allowNull: true  
  },
  chapitre: {
    type: DataTypes.STRING,
    allowNull: true  
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'blocked'),
    defaultValue: 'draft'
  },
  block_reason: {
    type: DataTypes.STRING,
    allowNull: true  
  },
}, {
  tableName: 'courses',
  timestamps: true
});

module.exports = Course;