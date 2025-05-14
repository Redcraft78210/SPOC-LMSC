const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
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
        type: DataTypes.STRING,
        allowNull: true
    },
    fingerprint: {
        type: DataTypes.STRING,
        allowNull: false
    },
    commit_msg: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'documents',
    timestamps: true
});

module.exports = Document;