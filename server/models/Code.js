const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Code = sequelize.define('Code', {
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remainingUses: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'codes',
  timestamps: false,
});

module.exports = Code;
