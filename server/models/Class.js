const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    main_teacher_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'teachers',
            key: 'id'
        }
    }
}, {
    tableName: 'classes',
    timestamps: false
});

module.exports = Class;
