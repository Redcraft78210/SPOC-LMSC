const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Recipient model
const Recipient = sequelize.define('Recipient', {
    MessageId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    recipientId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'recipients',
    timestamps: true
});

module.exports = Recipient;

