const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    shopId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    supplierId: {
        type: DataTypes.UUID
    },
    poNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING' // PENDING, RECEIVED, CANCELLED
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT
    }
});

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    purchaseOrderId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    totalCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = { PurchaseOrder, PurchaseOrderItem };
