/**
 * @fileoverview Modèle Sequelize pour la gestion des messages supprimés dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les messages placés dans la corbeille,
 * incluant la gestion de la suppression définitive et de la purge programmée.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un message supprimé dans le système de messagerie.
 * Les messages supprimés sont conservés temporairement dans cette table avant
 * leur suppression définitive programmée.
 * 
 * @class TrashMessage
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID du message dans la corbeille (clé primaire, généré automatiquement)
 * @property {string|null} originalMessageId - UUID du message original (peut être null si le message original est purgé)
 * @property {string} deletedBy - UUID de l'utilisateur qui a supprimé le message (obligatoire, référence vers la table users)
 * @property {Date} deletedAt - Date et heure de suppression du message (obligatoire)
 * @property {Date|null} scheduledPurgeDate - Date programmée pour la suppression définitive (optionnel)
 * @property {boolean} permanentlyDeleted - Indique si le message a été définitivement supprimé (par défaut: false)
 * @property {Date} createdAt - Date et heure de création de l'entrée dans la corbeille (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Déplacement d'un message vers la corbeille
 * const messageCorbeille = await TrashMessage.create({
 *   originalMessageId: '550e8400-e29b-41d4-a716-446655440000',
 *   deletedBy: '660e8400-e29b-41d4-a716-446655440001',
 *   deletedAt: new Date(),
 *   scheduledPurgeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
 * });
 * 
 * @example
 * // Recherche des messages supprimés par un utilisateur
 * const messagesSupprimes = await TrashMessage.findAll({
 *   where: { deletedBy: '660e8400-e29b-41d4-a716-446655440001' },
 *   order: [['deletedAt', 'DESC']]
 * });
 * 
 * @example
 * // Marquage d'un message comme définitivement supprimé
 * await TrashMessage.update(
 *   { permanentlyDeleted: true },
 *   { where: { id: '770e8400-e29b-41d4-a716-446655440002' } }
 * );
 */
const TrashMessage = sequelize.define('TrashMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    originalMessageId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    deletedBy: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    scheduledPurgeDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    permanentlyDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'trash_messages',
    timestamps: true,
});

module.exports = TrashMessage;