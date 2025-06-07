/**
 * @fileoverview Modèle Sequelize pour la gestion des documents dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les documents PDF stockés dans le système,
 * incluant les métadonnées comme le titre, la description et l'empreinte numérique.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un document dans le système éducatif.
 * Les documents sont généralement des fichiers PDF associés aux cours et contenus pédagogiques.
 * 
 * @class Document
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID du document (clé primaire, généré automatiquement)
 * @property {string} title - Titre du document (obligatoire)
 * @property {string|null} description - Description optionnelle du document
 * @property {string} fingerprint - Empreinte numérique unique du fichier (obligatoire, utilisée pour l'intégrité)
 * @property {string} commit_msg - Message de commit décrivant la version du document (obligatoire)
 * @property {Date} createdAt - Date et heure de création du document (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'un nouveau document
 * const nouveauDocument = await Document.create({
 *   title: 'Cours d\'Introduction à JavaScript',
 *   description: 'Document de cours pour débutants',
 *   fingerprint: 'a1b2c3d4e5f6',
 *   commit_msg: 'Version initiale du cours'
 * });
 * 
 * @example
 * // Recherche d'un document par son ID
 * const document = await Document.findByPk('550e8400-e29b-41d4-a716-446655440000');
 * 
 * @example
 * // Recherche de documents par titre
 * const documents = await Document.findAll({
 *   where: { title: { [Op.like]: '%JavaScript%' } }
 * });
 */
const Document = sequelize.define('Document', {
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
        type: DataTypes.STRING,
        allowNull: true
    },
    fingerprint: {
        type: DataTypes.STRING,
        allowNull: false
    },
    commit_msg: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'documents',
    timestamps: true
});

module.exports = Document;