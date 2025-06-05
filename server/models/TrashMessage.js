const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TrashMessage model for permanent storage of deleted messages
const TrashMessage = sequelize.define('TrashMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    originalMessageId: {
        type: DataTypes.UUID,
        allowNull: true, // Can be null if the original message is purged
    },
    deletedBy: {
        type: DataTypes.UUID,
        allowNull: false, // User who moved the message to trash
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    // For automatic purging after X days
    scheduledPurgeDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // For permanent deletion by user
    permanentlyDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'trash_messages',
    timestamps: true,
});

module.exports = TrashMessage;