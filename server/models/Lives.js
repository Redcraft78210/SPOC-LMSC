const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lives = sequelize.define('Lives', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    chapter: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'teachers',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'lives',
    timestamps: false
});

module.exports = Lives;