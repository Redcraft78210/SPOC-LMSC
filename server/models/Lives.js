/**
 * @fileoverview Modèle Sequelize pour la gestion des sessions de cours en direct dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les sessions live, incluant la planification,
 * le statut, et les associations avec les enseignants.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant une session de cours en direct.
 * Les sessions live permettent aux enseignants de diffuser du contenu en temps réel
 * et aux étudiants d'y assister de manière interactive.
 * 
 * @class Lives
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de la session (clé primaire, généré automatiquement)
 * @property {string} title - Titre de la session live (obligatoire)
 * @property {string|null} description - Description détaillée de la session (optionnel)
 * @property {string} subject - Matière ou discipline de la session (obligatoire)
 * @property {string|null} chapter - Chapitre ou section spécifique (optionnel)
 * @property {Date} start_time - Date et heure de début de la session (obligatoire)
 * @property {Date} end_time - Date et heure de fin de la session (obligatoire)
 * @property {('draft'|'scheduled'|'ongoing'|'completed'|'blocked'|'disapproved')} status - Statut actuel de la session (par défaut: 'scheduled')
 * @property {string|null} block_reason - Raison du blocage si la session est bloquée (optionnel)
 * @property {Date} createdAt - Date et heure de création de la session (par défaut: maintenant)
 * @property {Date} updatedAt - Date et heure de dernière modification (par défaut: maintenant)
 * @property {string} teacher_id - UUID de l'enseignant créateur (obligatoire, référence vers la table teachers)
 * 
 * @example
 * // Création d'une nouvelle session live
 * const nouvelleSession = await Lives.create({
 *   title: 'Introduction aux Bases de Données',
 *   description: 'Session interactive sur les concepts fondamentaux des BDD',
 *   subject: 'Informatique',
 *   chapter: 'Base de données relationnelles',
 *   start_time: new Date('2024-12-15T14:00:00Z'),
 *   end_time: new Date('2024-12-15T16:00:00Z'),
 *   teacher_id: '550e8400-e29b-41d4-a716-446655440000'
 * });
 * 
 * @example
 * // Recherche des sessions programmées d'un enseignant
 * const sessionsEnseignant = await Lives.findAll({
 *   where: { 
 *     teacher_id: '550e8400-e29b-41d4-a716-446655440000',
 *     status: 'scheduled'
 *   }
 * });
 * 
 * @example
 * // Mise à jour du statut d'une session
 * await session.update({
 *   status: 'ongoing'
 * });
 */
const Lives = sequelize.define('Lives', {
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
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    chapter: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('draft', 'scheduled', 'ongoing', 'completed', 'blocked', 'disapproved'),
        defaultValue: 'scheduled'
    },
    block_reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'teachers',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
}, {
    tableName: 'lives',
    timestamps: false
});

module.exports = Lives;