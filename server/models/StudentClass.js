const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('../models/Student');
const Classe = require('../models/Classe');

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
            model: Classe,
            key: 'id'
        }
    }
}, {
    tableName: 'student_classes',
    timestamps: false
});

module.exports = StudentClass;

