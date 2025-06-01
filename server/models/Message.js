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
    senderId: {
        type: DataTypes.UUID,
        allowNull: true, // Nullable for messages sent from contact form
    },
    recipientType: {
        type: DataTypes.ENUM('individual', 'multiple', 'all-admins', 'all-students', 'all-teachers'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    fromContactForm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'messages',
    timestamps: true,
});

module.exports = Message;