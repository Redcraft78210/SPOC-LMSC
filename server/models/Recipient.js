/**
 * @fileoverview Modèle Sequelize pour la gestion des destinataires de messages dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour la table de liaison entre les messages et leurs destinataires,
 * incluant le statut de lecture et la visibilité des messages pour chaque utilisateur.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un destinataire de message dans le système de messagerie.
 * Cette table de liaison permet de gérer les relations many-to-many entre les messages
 * et leurs destinataires, avec des métadonnées spécifiques à chaque relation.
 * 
 * @class Recipient
 * @extends {Sequelize.Model}
 * 
 * @property {string} MessageId - UUID du message associé (obligatoire, référence vers la table messages)
 * @property {string} recipientId - UUID du destinataire (obligatoire, référence vers la table users)
 * @property {boolean} hidden - Indique si le message est masqué pour ce destinataire (par défaut: false)
 * @property {boolean} read - Indique si le message a été lu par ce destinataire (par défaut: false)
 * @property {Date} createdAt - Date et heure de création de l'association (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'une nouvelle association message-destinataire
 * const nouveauDestinataire = await Recipient.create({
 *   MessageId: '550e8400-e29b-41d4-a716-446655440000',
 *   recipientId: '660e8400-e29b-41d4-a716-446655440001',
 *   hidden: false,
 *   read: false
 * });
 * 
 * @example
 * // Marquer un message comme lu pour un destinataire
 * await Recipient.update(
 *   { read: true },
 *   { where: { MessageId: messageId, recipientId: userId } }
 * );
 * 
 * @example
 * // Masquer un message pour un destinataire spécifique
 * await Recipient.update(
 *   { hidden: true },
 *   { where: { MessageId: messageId, recipientId: userId } }
 * );
 * 
 * @example
 * // Récupérer tous les destinataires d'un message
 * const destinataires = await Recipient.findAll({
 *   where: { MessageId: messageId }
 * });
 */
const Recipient = sequelize.define('Recipient', {
    MessageId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    recipientId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'recipients',
    timestamps: true
});

module.exports = Recipient;

