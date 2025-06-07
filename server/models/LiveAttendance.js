/**
 * @fileoverview Modèle Sequelize pour la gestion de l'assiduité aux sessions en direct dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour enregistrer la présence des utilisateurs
 * aux sessions de cours en direct, avec un statut de présence/absence.
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant l'assiduité d'un utilisateur à une session en direct.
 * Ce modèle enregistre si un utilisateur a assisté ou manqué une session de cours en direct,
 * avec une contrainte d'unicité pour éviter les doublons par utilisateur et session.
 * 
 * @class LiveAttendance
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de l'enregistrement d'assiduité (clé primaire, généré automatiquement)
 * @property {string} user_id - UUID de l'utilisateur concerné (obligatoire, référence vers la table users)
 * @property {string} live_id - UUID de la session en direct concernée (obligatoire, référence vers la table lives)
 * @property {('attended'|'missed')} status - Statut de présence de l'utilisateur (obligatoire)
 * @property {Date} createdAt - Date et heure de création de l'enregistrement (par défaut: maintenant)
 * @property {Date} updatedAt - Date et heure de dernière modification (par défaut: maintenant)
 * 
 * @example
 * // Enregistrement d'une présence à une session
 * const presence = await LiveAttendance.create({
 *   user_id: '550e8400-e29b-41d4-a716-446655440000',
 *   live_id: '660e8400-e29b-41d4-a716-446655440001',
 *   status: 'attended'
 * });
 * 
 * @example
 * // Recherche de l'assiduité d'un utilisateur pour une session spécifique
 * const attendance = await LiveAttendance.findOne({
 *   where: {
 *     user_id: '550e8400-e29b-41d4-a716-446655440000',
 *     live_id: '660e8400-e29b-41d4-a716-446655440001'
 *   }
 * });
 * 
 * @example
 * // Récupération de toutes les présences d'une session
 * const sessionAttendance = await LiveAttendance.findAll({
 *   where: { live_id: '660e8400-e29b-41d4-a716-446655440001' },
 *   include: [{ model: User, attributes: ['name', 'email'] }]
 * });
 */
const LiveAttendance = sequelize.define('LiveAttendance', {
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
    live_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'lives',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.ENUM('attended', 'missed'),
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
    tableName: 'live_attendance',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'live_id']
        }
    ]
});

module.exports = LiveAttendance;