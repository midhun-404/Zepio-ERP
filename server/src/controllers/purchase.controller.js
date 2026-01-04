const { sequelize, PurchaseOrder, PurchaseOrderItem, Product, Supplier } = require('../models');

exports.createPO = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { shopId } = req.user;
        const { supplierId, items, notes } = req.body; // items: [{ productId, quantity, unitCost }]

        let totalAmount = 0;
        const poItemsData = items.map(item => {
            const totalCost = Number(item.unitCost) * Number(item.quantity);
            totalAmount += totalCost;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitCost: item.unitCost,
                totalCost
            };
        });

        const poNumber = `PO-${Date.now().toString().slice(-6)}`;

        const po = await PurchaseOrder.create({
            shopId,
            supplierId,
            poNumber,
            totalAmount,
            notes,
            status: 'PENDING'
        }, { transaction });

        await PurchaseOrderItem.bulkCreate(
            poItemsData.map(item => ({ ...item, purchaseOrderId: po.id })),
            { transaction }
        );

        await transaction.commit();
        res.status(201).json(po);
    } catch (error) {
        await transaction.rollback();
        console.error('Create PO Error:', error);
        res.status(400).json({ error: 'Failed to create Purchase Order' });
    }
};

exports.getPOs = async (req, res) => {
    try {
        const { shopId } = req.user;
        const pos = await PurchaseOrder.findAll({
            where: { shopId },
            include: ['supplier', { association: 'items', include: ['product'] }],
            order: [['date', 'DESC']]
        });
        res.json(pos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Purchase Orders' });
    }
};

exports.receivePO = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { shopId } = req.user;

        const po = await PurchaseOrder.findOne({
            where: { id, shopId },
            include: ['items'],
            transaction
        });

        if (!po) throw new Error('Purchase Order not found');
        if (po.status === 'RECEIVED') throw new Error('PO already received');
        if (po.status === 'CANCELLED') throw new Error('Cannot receive cancelled PO');

        // Update Stock
        for (const item of po.items) {
            await Product.increment('stock', {
                by: item.quantity,
                where: { id: item.productId, shopId },
                transaction
            });
            // Optional: Update Cost Price to weighted average or latest cost?
            // For now keeping simple.
        }

        await po.update({ status: 'RECEIVED' }, { transaction });

        await transaction.commit();
        res.json({ message: 'PO Received and Stock Updated' });
    } catch (error) {
        await transaction.rollback();
        console.error('Receive PO Error:', error);
        res.status(400).json({ error: error.message });
    }
};
