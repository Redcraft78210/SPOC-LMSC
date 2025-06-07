/**
 * @fileoverview Modèle Sequelize pour la gestion des associations entre cours et vidéos.
 * Ce module définit la table de liaison many-to-many entre les cours et les vidéos,
 * permettant d'associer plusieurs vidéos à un cours et de marquer une vidéo principale.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant l'association entre un cours et ses vidéos.
 * Cette table de liaison permet de gérer les relations many-to-many entre les cours
 * et les vidéos, avec la possibilité de marquer une vidéo comme principale.
 * 
 * @class CourseVideo
 * @extends {Sequelize.Model}
 * 
 * @property {string} course_id - UUID du cours associé (clé primaire composite, référence vers la table courses)
 * @property {string} video_id - UUID de la vidéo associée (clé primaire composite, référence vers la table videos)
 * @property {boolean} is_main - Indique si la vidéo est la vidéo principale du cours (par défaut: false)
 * 
 * @example
 * // Association d'une vidéo à un cours
 * const association = await CourseVideo.create({
 *   course_id: '550e8400-e29b-41d4-a716-446655440000',
 *   video_id: '660e8400-e29b-41d4-a716-446655440001',
 *   is_main: true
 * });
 * 
 * @example
 * // Récupération de toutes les vidéos d'un cours
 * const videosAssociation = await CourseVideo.findAll({
 *   where: { course_id: '550e8400-e29b-41d4-a716-446655440000' }
 * });
 * 
 * @example
 * // Recherche de la vidéo principale d'un cours
 * const mainVideo = await CourseVideo.findOne({
 *   where: { 
 *     course_id: '550e8400-e29b-41d4-a716-446655440000',
 *     is_main: true 
 *   }
 * });
 */
const CourseVideo = sequelize.define('CourseVideo', {
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
  video_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'videos',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'course_videos',
  timestamps: false
});

module.exports = CourseVideo;