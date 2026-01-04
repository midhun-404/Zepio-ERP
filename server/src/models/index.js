const sequelize = require('../config/database');
const Shop = require('./Shop');
const User = require('./User');
const Product = require('./Product');
const Customer = require('./Customer');
const { Invoice, InvoiceItem } = require('./Invoice');
const Payment = require('./Payment');
const Supplier = require('./Supplier');
const { PurchaseOrder, PurchaseOrderItem } = require('./PurchaseOrder');

// Shop Relations
Shop.hasMany(User, { foreignKey: 'shopId', as: 'users' });
User.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

Shop.hasMany(Product, { foreignKey: 'shopId', as: 'products' });
Product.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

Shop.hasMany(Customer, { foreignKey: 'shopId', as: 'customers' });
Customer.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

Shop.hasMany(Invoice, { foreignKey: 'shopId', as: 'invoices' });
Invoice.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

Shop.hasMany(Payment, { foreignKey: 'shopId', as: 'payments' });
Payment.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

// Supplier Relations
Shop.hasMany(Supplier, { foreignKey: 'shopId', as: 'suppliers' });
Supplier.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

// PO Relations
Shop.hasMany(PurchaseOrder, { foreignKey: 'shopId', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', as: 'purchaseOrders' });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId', as: 'items', onDelete: 'CASCADE' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });

PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
// Optionally: Product.hasMany(PurchaseOrderItem)

// Invoice Relations
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' });

// InvoiceItem Relations
InvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(InvoiceItem, { foreignKey: 'productId', as: 'invoiceItems' });

// Payment Relations
Payment.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Payment, { foreignKey: 'customerId', as: 'payments' });

module.exports = {
    sequelize,
    Shop,
    User,
    Product,
    Customer,
    Invoice,
    InvoiceItem,
    Payment,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem
};
