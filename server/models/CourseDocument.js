/**
 * @fileoverview Modèle Sequelize pour la gestion des associations entre cours et documents.
 * Ce module définit la table de liaison many-to-many entre les cours et les documents,
 * permettant d'associer plusieurs documents à un cours et de marquer un document principal.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant l'association entre un cours et ses documents.
 * Cette table de liaison permet de gérer les relations many-to-many entre les cours
 * et les documents, avec la possibilité de marquer un document comme principal.
 * 
 * @class CourseDocument
 * @extends {Sequelize.Model}
 * 
 * @property {string} course_id - UUID du cours associé (clé primaire composite, référence vers la table courses)
 * @property {string} document_id - UUID du document associé (clé primaire composite, référence vers la table documents)
 * @property {boolean} is_main - Indique si le document est le document principal du cours (par défaut: false)
 * 
 * @example
 * // Association d'un document à un cours
 * const association = await CourseDocument.create({
 *   course_id: '550e8400-e29b-41d4-a716-446655440000',
 *   document_id: '660e8400-e29b-41d4-a716-446655440001',
 *   is_main: true
 * });
 * 
 * @example
 * // Récupération de tous les documents d'un cours
 * const documentsAssociation = await CourseDocument.findAll({
 *   where: { course_id: '550e8400-e29b-41d4-a716-446655440000' }
 * });
 * 
 * @example
 * // Recherche du document principal d'un cours
 * const mainDocument = await CourseDocument.findOne({
 *   where: { 
 *     course_id: '550e8400-e29b-41d4-a716-446655440000',
 *     is_main: true 
 *   }
 * });
 */
const CourseDocument = sequelize.define('CourseDocument', {
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  document_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'documents',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'course_documents',
  timestamps: false
});

module.exports = CourseDocument;