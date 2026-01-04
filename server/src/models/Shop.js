const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shop = sequelize.define('Shop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ownerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD'
    },
    currencySymbol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '$'
    },
    timezone: {
        type: DataTypes.STRING,
        defaultValue: 'UTC'
    },
    deadStockDays: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    isDemo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    plan: {
        type: DataTypes.STRING,
        defaultValue: 'FREE'
    },
    // New Config Fields
    taxPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    taxInclusive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    address: {
        type: DataTypes.TEXT
    },
    logoUrl: {
        type: DataTypes.STRING
    },
    receiptFooter: {
        type: DataTypes.STRING
    }
});

module.exports = Shop;
