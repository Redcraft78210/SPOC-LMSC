/**
 * @fileoverview Modèle Sequelize pour la gestion des vidéos dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les vidéos associées aux cours,
 * incluant les métadonnées comme la durée, les images de couverture et l'empreinte numérique.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant une vidéo dans le système éducatif.
 * Les vidéos sont associées aux cours et contenus pédagogiques avec leurs métadonnées.
 * 
 * @class Video
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de la vidéo (clé primaire, généré automatiquement)
 * @property {Buffer|null} cover_image - Image de couverture de la vidéo au format BLOB (optionnel)
 * @property {Buffer|null} preview_image - Image de prévisualisation de la vidéo au format BLOB (optionnel)
 * @property {number} duration - Durée de la vidéo en secondes (obligatoire, par défaut: 0)
 * @property {string} fingerprint - Empreinte numérique unique du fichier vidéo (obligatoire, utilisée pour l'intégrité)
 * @property {string} commit_msg - Message de commit décrivant la version de la vidéo (obligatoire)
 * @property {Date} createdAt - Date et heure de création de la vidéo (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'une nouvelle vidéo
 * const nouvelleVideo = await Video.create({
 *   duration: 1800,
 *   fingerprint: 'a1b2c3d4e5f6',
 *   commit_msg: 'Version initiale de la vidéo de cours'
 * });
 * 
 * @example
 * // Recherche d'une vidéo par son ID
 * const video = await Video.findByPk('550e8400-e29b-41d4-a716-446655440000');
 * 
 * @example
 * // Recherche de vidéos par durée
 * const videosLongues = await Video.findAll({
 *   where: { duration: { [Op.gt]: 3600 } }
 * });
 */
const Video = sequelize.define('Video', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cover_image: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    },
    preview_image: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    tableName: 'videos',
    timestamps: true
});

module.exports = Video;
