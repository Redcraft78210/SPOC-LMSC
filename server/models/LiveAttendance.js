const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LiveAttendance = sequelize.define('LiveAttendance', {
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
        onDelete: 'CASCADE'
    },
    live_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'lives',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.ENUM('attended', 'missed'),
        allowNull: false,
    },
    "createdAt": {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
    },
    "updatedAt": {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
    },
}, {
    tableName: 'live_attendance',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'live_id']
        }
    ]
});

module.exports = LiveAttendance;