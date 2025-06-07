/**
 * @fileoverview Configuration et initialisation de la connexion à la base de données PostgreSQL via Sequelize.
 * Ce module établit la connexion à la base de données en utilisant les variables d'environnement et exporte
 * l'instance Sequelize pour être utilisée dans l'application.
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Instance Sequelize configurée pour se connecter à la base de données PostgreSQL.
 * Utilise les variables d'environnement pour les paramètres de connexion.
 * 
 * @type {Sequelize}
 * @example
 * // Pour utiliser l'instance dans un autre fichier:
 * const sequelize = require('./config/database');
 * 
 * // Définir un modèle:
 * const User = sequelize.define('User', {...});
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: (msg) => console.log(msg),
  }
);

/**
 * Tente d'établir la connexion à la base de données et affiche un message de statut.
 * 
 * @throws {Error} Si la connexion à la base de données échoue, l'erreur est journalisée
 * dans la console mais n'interrompt pas l'exécution du programme.
 */
sequelize
  .authenticate()
  .then(() => console.log('Database connection established successfully.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
