/**
 * @fileoverview Modèle Sequelize pour la gestion des pièces jointes associées aux messages.
 * Ce modèle définit la structure et les contraintes des pièces jointes stockées dans la base de données,
 * incluant la gestion des scans de sécurité et la suppression logique.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant une pièce jointe associée à un message.
 * Gère les fichiers uploadés par les utilisateurs avec validation de sécurité
 * et métadonnées complètes.
 * 
 * @class Attachment
 * @property {string} id - Identifiant unique UUID généré automatiquement
 * @property {string} MessageId - Clé étrangère vers le message associé
 * @property {string} filename - Nom du fichier stocké dans le système de fichiers
 * @property {number} fileSize - Taille du fichier en octets
 * @property {string} mimeType - Type MIME du fichier (ex: 'image/jpeg', 'application/pdf')
 * @property {('pending'|'clean'|'infected')} scanStatus - Statut du scan de sécurité
 * @property {Date} createdAt - Date de création automatique (Sequelize)
 * @property {Date} updatedAt - Date de dernière modification automatique (Sequelize)
 * @property {Date|null} deletedAt - Date de suppression logique (paranoid mode)
 * 
 * @example
 * // Création d'une nouvelle pièce jointe
 * const attachment = await Attachment.create({
 *   MessageId: 'uuid-du-message',
 *   filename: 'document.pdf',
 *   fileSize: 1048576,
 *   mimeType: 'application/pdf'
 * });
 * 
 * @example
 * // Recherche des pièces jointes d'un message
 * const attachments = await Attachment.findAll({
 *   where: { MessageId: messageId }
 * });
 * 
 * @example
 * // Mise à jour du statut de scan
 * await attachment.update({
 *   scanStatus: 'clean'
 * });
 */
const Attachment = sequelize.define('Attachment', {
    /**
     * Identifiant unique de la pièce jointe
     * @type {string}
     */
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    
    /**
     * Identifiant du message auquel la pièce jointe est associée
     * @type {string}
     */
    MessageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Message',
            key: 'id',
        },
    },
    
    /**
     * Nom du fichier tel qu'il est stocké dans le système de fichiers
     * @type {string}
     */
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    /**
     * Taille du fichier en octets
     * @type {number}
     */
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    
    /**
     * Type MIME du fichier (ex: 'image/jpeg', 'application/pdf')
     * @type {string}
     */
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    /**
     * Statut du scan de sécurité du fichier
     * @type {('pending'|'clean'|'infected')}
     */
    scanStatus: {
        type: DataTypes.ENUM('pending', 'clean', 'infected'),
        defaultValue: 'pending',
    }
}, {
    tableName: 'attachments',
    timestamps: true,
    paranoid: true,
});

module.exports = Attachment;