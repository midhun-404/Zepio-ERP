const { Supplier } = require('../models');

exports.createSupplier = async (req, res) => {
    try {
        const { shopId } = req.user;
        const supplier = await Supplier.create({ ...req.body, shopId });
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create supplier' });
    }
};

exports.getSuppliers = async (req, res) => {
    try {
        const { shopId } = req.user;
        const suppliers = await Supplier.findAll({ where: { shopId } });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { shopId } = req.user;
        const [updated] = await Supplier.update(req.body, { where: { id, shopId } });
        if (!updated) return res.status(404).json({ error: 'Supplier not found' });
        res.json({ message: 'Supplier updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update supplier' });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { shopId } = req.user;
        await Supplier.destroy({ where: { id, shopId } });
        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
};
