const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Classe = require('./Classe');
const Lives = require('./Lives');

const ClassLives = sequelize.define('ClassLives', {
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Classe,
      key: 'id',
    },
  },
  live_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Lives,
      key: 'id',
    },
  },
}, {
  tableName: 'class_lives',
  timestamps: false,
});

module.exports = ClassLives;

