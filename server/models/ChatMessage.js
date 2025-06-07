/**
 * @fileoverview Modèle Sequelize pour les messages de chat en temps réel des sessions live.
 * Ce modèle gère les messages échangés entre les utilisateurs pendant les sessions live,
 * avec des relations vers les lives et les utilisateurs, et une suppression en cascade
 * lors de la suppression des entités parentes.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un message de chat dans une session live.
 * Chaque message est associé à un live spécifique et à un utilisateur.
 * 
 * @class ChatMessage
 * @extends {sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID du message (clé primaire)
 * @property {string} live_id - Identifiant UUID du live associé (clé étrangère vers Lives)
 * @property {string} user_id - Identifiant UUID de l'utilisateur auteur (clé étrangère vers users)
 * @property {string} content - Contenu textuel du message
 * @property {Date} createdAt - Date et heure de création du message
 * @property {Date} updatedAt - Date et heure de dernière modification du message
 * 
 * @example
 * // Créer un nouveau message de chat
 * const message = await ChatMessage.create({
 *   live_id: 'uuid-du-live',
 *   user_id: 'uuid-de-l-utilisateur',
 *   content: 'Bonjour tout le monde !'
 * });
 * 
 * @example
 * // Récupérer tous les messages d'un live
 * const messages = await ChatMessage.findAll({
 *   where: { live_id: 'uuid-du-live' },
 *   order: [['createdAt', 'ASC']]
 * });
 */
const ChatMessage = sequelize.define('ChatMessage', {
    /**
     * Identifiant unique du message de chat
     * @type {string}
     * @primaryKey
     */
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    /**
     * Identifiant du live auquel appartient ce message
     * @type {string}
     * @foreignKey
     */
    live_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Lives',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    /**
     * Identifiant de l'utilisateur qui a envoyé le message
     * @type {string}
     * @foreignKey
     */
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    /**
     * Contenu textuel du message de chat
     * @type {string}
     */
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    /**
     * Date et heure de création du message
     * @type {Date}
     */
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    /**
     * Date et heure de dernière modification du message
     * @type {Date}
     */
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'chat_messages',
    timestamps: false,
});

module.exports = ChatMessage;