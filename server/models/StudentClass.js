const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('../models/Student');
const Class = require('../models/Class');

const StudentClass = sequelize.define('StudentClass', {
    'student_id': {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Student,
            key: 'id'
        }
    },
    'class_id': {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Class,
            key: 'id'
        }
    }
}, {
    tableName: 'student_classes',
    timestamps: false
});

module.exports = StudentClass;

