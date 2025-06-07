/**
 * @fileoverview Modèle Sequelize pour la gestion des étudiants dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les étudiants, incluant leurs informations
 * personnelles, statut, et paramètres de sécurité comme l'authentification à deux facteurs.
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un étudiant dans le système éducatif.
 * Les étudiants ont accès aux cours, peuvent suivre leur progression et interagir
 * avec le contenu pédagogique de la plateforme.
 * 
 * @class Student
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de l'étudiant (clé primaire, généré automatiquement)
 * @property {string} name - Prénom de l'étudiant (obligatoire)
 * @property {string} surname - Nom de famille de l'étudiant (obligatoire)
 * @property {string} username - Nom d'utilisateur unique pour la connexion (obligatoire)
 * @property {string} email - Adresse email unique de l'étudiant (obligatoire)
 * @property {string} statut - Statut actuel de l'étudiant (par défaut: 'actif')
 * @property {boolean} firstLogin - Indique si c'est la première connexion de l'étudiant (par défaut: true)
 * @property {string} password - Mot de passe haché de l'étudiant (obligatoire)
 * @property {boolean} twoFAEnabled - Indique si l'authentification à deux facteurs est activée (par défaut: false)
 * @property {string|null} twoFASecret - Secret pour l'authentification à deux facteurs (optionnel)
 * @property {Date} createdAt - Date et heure de création du compte (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'un nouvel étudiant
 * const nouvelEtudiant = await Student.create({
 *   name: 'Jean',
 *   surname: 'Dupont',
 *   username: 'jean.dupont',
 *   email: 'jean.dupont@example.com',
 *   password: 'motDePasseHache',
 *   statut: 'actif'
 * });
 * 
 * @example
 * // Recherche d'un étudiant par email
 * const etudiant = await Student.findOne({
 *   where: { email: 'jean.dupont@example.com' }
 * });
 * 
 * @example
 * // Activation de l'authentification à deux facteurs
 * await etudiant.update({
 *   twoFAEnabled: true,
 *   twoFASecret: 'secretGenere'
 * });
 */
const Student = sequelize.define(
  'Student',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'actif',
    },
    firstLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    "twoFAEnabled": {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    "twoFASecret": {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  },
);

module.exports = Student;

