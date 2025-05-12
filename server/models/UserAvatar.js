const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAvatar = sequelize.define('UserAvatar', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    unique: true
  },
  mime_type: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  original_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  compressed_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: false
  },
  compression_quality: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      min: 50,  // 50% qualité minimum
      max: 100  // 100% qualité maximum
    }
  },
  dimensions: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'user_avatars',
  timestamps: true
});

module.exports = UserAvatar;