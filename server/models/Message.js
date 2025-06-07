/**
 * @fileoverview Modèle Sequelize pour la gestion des messages dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les messages échangés entre utilisateurs,
 * incluant les messages individuels, groupés et les messages provenant du formulaire de contact.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un message dans le système de messagerie.
 * Les messages peuvent être envoyés entre utilisateurs individuels, à des groupes spécifiques,
 * ou provenir du formulaire de contact public.
 * 
 * @class Message
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID du message (clé primaire, généré automatiquement)
 * @property {string} subject - Sujet du message (obligatoire)
 * @property {string|null} senderId - UUID de l'expéditeur (optionnel pour les messages du formulaire de contact)
 * @property {('individual'|'multiple'|'all-admins'|'all-students'|'all-teachers')} recipientType - Type de destinataire du message (obligatoire)
 * @property {string} content - Contenu textuel du message (obligatoire)
 * @property {boolean} fromContactForm - Indique si le message provient du formulaire de contact (par défaut: false)
 * @property {Date} createdAt - Date et heure de création du message (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'un message individuel
 * const nouveauMessage = await Message.create({
 *   subject: 'Demande d\'information',
 *   senderId: '550e8400-e29b-41d4-a716-446655440000',
 *   recipientType: 'individual',
 *   content: 'Bonjour, j\'ai une question concernant le cours...',
 *   fromContactForm: false
 * });
 * 
 * @example
 * // Création d'un message pour tous les administrateurs
 * const messageAdmin = await Message.create({
 *   subject: 'Rapport d\'incident',
 *   senderId: '660e8400-e29b-41d4-a716-446655440001',
 *   recipientType: 'all-admins',
 *   content: 'Un problème technique a été détecté...',
 *   fromContactForm: false
 * });
 * 
 * @example
 * // Message provenant du formulaire de contact
 * const messageContact = await Message.create({
 *   subject: 'Demande de renseignements',
 *   senderId: null,
 *   recipientType: 'all-admins',
 *   content: 'Bonjour, je souhaiterais avoir des informations...',
 *   fromContactForm: true
 * });
 */
const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    recipientType: {
        type: DataTypes.ENUM('individual', 'multiple', 'all-admins', 'all-students', 'all-teachers'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    fromContactForm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'messages',
    timestamps: true,
});

module.exports = Message;