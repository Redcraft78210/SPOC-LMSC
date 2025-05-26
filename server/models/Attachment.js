const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Attachment model
const Attachment = sequelize.define('Attachment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    MessageId: {  // Foreign key to Message model
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Message',  // Assuming the table name is 'Messages'
            key: 'id',
        },
    },
    filename: {  // UUID-based filename in the filesystem
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scanStatus: {
        type: DataTypes.ENUM('pending', 'clean', 'infected'),
        defaultValue: 'pending',
    }
}, {
    tableName: 'attachments',
    timestamps: true,
    paranoid: true, // Enables soft deletes
});

module.exports = Attachment;