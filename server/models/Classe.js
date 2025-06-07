/**
 * @fileoverview Modèle Sequelize pour la gestion des classes dans l'application SPOC-LMSC.
 * Ce module définit la structure de données et les contraintes pour les classes,
 * incluant les associations avec les enseignants principaux.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant une classe dans le système éducatif.
 * Une classe peut avoir un enseignant principal et contenir plusieurs étudiants.
 * 
 * @class Classe
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de la classe (clé primaire)
 * @property {string} name - Nom de la classe (obligatoire)
 * @property {string|null} description - Description optionnelle de la classe
 * @property {string|null} main_teacher_id - UUID de l'enseignant principal (référence vers la table teachers)
 * 
 * @example
 * // Création d'une nouvelle classe
 * const nouvelleClasse = await Classe.create({
 *   name: "Mathématiques Avancées",
 *   description: "Cours de mathématiques pour niveau avancé",
 *   main_teacher_id: "550e8400-e29b-41d4-a716-446655440000"
 * });
 * 
 * @example
 * // Recherche d'une classe par ID
 * const classe = await Classe.findByPk("123e4567-e89b-12d3-a456-426614174000");
 */
const Classe = sequelize.define('Classe', {
    /**
     * Identifiant unique de la classe
     * @type {string}
     */
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    /**
     * Nom de la classe
     * @type {string}
     */
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    /**
     * Description optionnelle de la classe
     * @type {string|null}
     */
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    /**
     * Identifiant UUID de l'enseignant principal
     * @type {string|null}
     */
    main_teacher_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'teachers',
            key: 'id'
        }
    }
}, {
    tableName: 'classes',
    timestamps: false
});

module.exports = Classe;
