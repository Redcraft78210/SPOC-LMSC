const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseProgress = sequelize.define('CourseProgress', {
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
    course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        },
    },
    status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
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
    tableName: 'course_progress',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'course_id']
        }
    ]
});

module.exports = CourseProgress;