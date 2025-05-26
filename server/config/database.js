const { Sequelize } = require('sequelize');
require('dotenv').config();

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

sequelize
  .authenticate()
  .then(() => console.log('Database connection established successfully.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
