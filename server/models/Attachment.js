const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Attachment model
const Attachment = sequelize.define('Attachment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    filename: {  // UUID-based filename in the filesystem
        type: DataTypes.STRING,
        allowNull: false,
    },
    originalFilename: {  // Original filename for display and download
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