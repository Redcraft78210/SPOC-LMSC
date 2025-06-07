/**
 * @fileoverview Modèle Sequelize pour la gestion du progrès des utilisateurs dans les cours.
 * Ce module définit la structure de données pour suivre l'avancement des étudiants
 * dans leurs cours, avec des statuts de progression et des contraintes d'unicité.
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant le progrès d'un utilisateur dans un cours spécifique.
 * Permet de suivre l'état d'avancement des étudiants avec des statuts prédéfinis
 * et assure l'unicité de la relation utilisateur-cours.
 * 
 * @class CourseProgress
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID du progrès (clé primaire)
 * @property {string} user_id - UUID de l'utilisateur (référence vers la table users, suppression en cascade)
 * @property {string} course_id - UUID du cours (référence vers la table courses)
 * @property {('not_started'|'in_progress'|'completed')} status - Statut de progression dans le cours
 * @property {Date} createdAt - Date et heure de création de l'enregistrement
 * @property {Date} updatedAt - Date et heure de dernière mise à jour
 * 
 * @example
 * // Création d'un nouvel enregistrement de progrès
 * const nouveauProgres = await CourseProgress.create({
 *   user_id: '550e8400-e29b-41d4-a716-446655440000',
 *   course_id: '660e8400-e29b-41d4-a716-446655440001',
 *   status: 'in_progress'
 * });
 * 
 * @example
 * // Recherche du progrès d'un utilisateur pour un cours spécifique
 * const progres = await CourseProgress.findOne({
 *   where: {
 *     user_id: '550e8400-e29b-41d4-a716-446655440000',
 *     course_id: '660e8400-e29b-41d4-a716-446655440001'
 *   }
 * });
 * 
 * @example
 * // Mise à jour du statut de progression
 * await progres.update({
 *   status: 'completed'
 * });
 */
const CourseProgress = sequelize.define('CourseProgress', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        },
    },
    status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        allowNull: false,
    },
    "createdAt": {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
    },
    "updatedAt": {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
    },
}, {
    tableName: 'course_progress',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'course_id']
        }
    ]
});

module.exports = CourseProgress;