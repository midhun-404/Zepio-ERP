const { sequelize, User, Shop, Product, Invoice, InvoiceItem, Payment, Customer, Supplier, PurchaseOrder, PurchaseOrderItem } = require('../models');

exports.resetShopData = async (req, res) => {
    console.log('--- RESET SHOP DATA REQUEST START ---');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    const transaction = await sequelize.transaction();
    try {
        const { shopId } = req.user;
        const { type } = req.body; // 'sales', 'all'

        console.log(`Executing Reset for Shop: ${shopId}, Type: ${type}`);

        if (!['sales', 'all'].includes(type)) {
            console.error('Invalid type received:', type);
            return res.status(400).json({ error: 'Invalid reset type' });
        }

        // 1. Always delete SALES data (Invoices, Items, Payments)
        // Find invoices to get IDs for Item deletion
        const invoices = await Invoice.findAll({ where: { shopId }, transaction });
        const invoiceIds = invoices.map(i => i.id);

        if (invoiceIds.length > 0) {
            await InvoiceItem.destroy({ where: { invoiceId: invoiceIds }, transaction });
        }
        await Payment.destroy({ where: { shopId }, transaction });
        await Invoice.destroy({ where: { shopId }, transaction });

        // 2. If Factory Reset ('all'), delete Inventory & CRM
        if (type === 'all') {
            // POs depend on Suppliers and Products. Delete POs first.
            const pos = await PurchaseOrder.findAll({ where: { shopId }, transaction });
            const poIds = pos.map(p => p.id);
            if (poIds.length > 0) {
                await PurchaseOrderItem.destroy({ where: { purchaseOrderId: poIds }, transaction });
                await PurchaseOrder.destroy({ where: { shopId }, transaction });
            }

            await Product.destroy({ where: { shopId }, transaction });
            await Customer.destroy({ where: { shopId }, transaction });
            await Supplier.destroy({ where: { shopId }, transaction });
        }

        await transaction.commit();
        res.json({ message: type === 'all' ? 'Factory reset complete' : 'Sales data reset complete' });

    } catch (error) {
        await transaction.rollback();
        console.error('Reset Data Error:', error);
        res.status(500).json({ error: 'Failed to reset data' });
    }
};

exports.deleteAccount = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { shopId } = req.user;

        // Cascade delete everything manually to be safe
        // 1. Sales
        const invoices = await Invoice.findAll({ where: { shopId }, transaction });
        const invoiceIds = invoices.map(i => i.id);
        if (invoiceIds.length > 0) {
            await InvoiceItem.destroy({ where: { invoiceId: invoiceIds }, transaction });
        }
        await Payment.destroy({ where: { shopId }, transaction });
        await Invoice.destroy({ where: { shopId }, transaction });

        // 2. Inventory & CRM & POs
        // Delete POs first
        const pos = await PurchaseOrder.findAll({ where: { shopId }, transaction });
        const poIds = pos.map(p => p.id);
        if (poIds.length > 0) {
            await PurchaseOrderItem.destroy({ where: { purchaseOrderId: poIds }, transaction });
            await PurchaseOrder.destroy({ where: { shopId }, transaction });
        }

        await Product.destroy({ where: { shopId }, transaction });
        await Customer.destroy({ where: { shopId }, transaction });
        await Supplier.destroy({ where: { shopId }, transaction });

        // 3. Shop & Users
        await User.destroy({ where: { shopId }, transaction });
        await Shop.destroy({ where: { id: shopId }, transaction });

        await transaction.commit();
        res.json({ message: 'Account deleted successfully' });

    } catch (error) {
        await transaction.rollback();
        console.error('Delete Account Error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const { shopId } = req.user;
        const shop = await Shop.findByPk(shopId);
        res.json(shop);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { shopId } = req.user;
        console.log('Update Settings Request for Shop:', shopId);
        // console.log('Update Payload:', req.body);

        const shop = await Shop.findByPk(shopId);
        if (!shop) {
            console.error('Shop not found for update:', shopId);
            return res.status(404).json({ error: 'Shop not found' });
        }

        await shop.update(req.body);
        console.log('Shop updated successfully. New Data:', shop.toJSON());

        res.json(shop);
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
