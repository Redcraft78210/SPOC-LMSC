/**
 * @fileoverview Modèle Sequelize pour la gestion des threads de discussion dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les threads qui servent de sujets de discussion
 * dans les forums et espaces de communication de la plateforme éducative.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un thread de discussion dans le système de forum.
 * Les threads sont créés par les utilisateurs pour initier des discussions sur des sujets
 * spécifiques et peuvent recevoir des commentaires d'autres utilisateurs.
 * 
 * @class Thread
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID du thread (clé primaire, généré automatiquement)
 * @property {string} title - Titre du thread de discussion (obligatoire)
 * @property {string} content - Contenu principal du thread (obligatoire, type TEXT pour les longs textes)
 * @property {string} authorId - UUID de l'auteur du thread (obligatoire, référence vers la table users)
 * @property {Date} createdAt - Date et heure de création du thread (par défaut: maintenant)
 * 
 * @example
 * // Création d'un nouveau thread de discussion
 * const nouveauThread = await Thread.create({
 *   title: 'Question sur le cours de JavaScript',
 *   content: 'Je ne comprends pas le concept des closures, pourriez-vous m\'expliquer ?',
 *   authorId: '550e8400-e29b-41d4-a716-446655440000'
 * });
 * 
 * @example
 * // Recherche de threads par auteur
 * const threadsUtilisateur = await Thread.findAll({
 *   where: { authorId: '550e8400-e29b-41d4-a716-446655440000' },
 *   order: [['createdAt', 'DESC']]
 * });
 * 
 * @example
 * // Recherche de threads par titre
 * const threadsJavaScript = await Thread.findAll({
 *   where: { title: { [Op.like]: '%JavaScript%' } }
 * });
 */
const Thread = sequelize.define('Thread', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'threads',
    timestamps: false,
});

module.exports = Thread;

