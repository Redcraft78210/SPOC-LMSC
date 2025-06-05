const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


// Message model
const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    fromContactForm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'messages',
    timestamps: true,
    paranoid: true, // Enables soft deletes
});

module.exports = Message;