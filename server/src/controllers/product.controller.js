const { Product } = require('../models');

exports.createProduct = async (req, res) => {
    try {
        const { name, category, description, price, costPrice, stock, sku, barcode } = req.body;
        const { shopId } = req.user;

        // TODO: Check for constraints (e.g. max products for demo)

        const product = await Product.create({
            shopId,
            name,
            category,
            description,
            price,
            costPrice,
            stock,
            sku,
            barcode
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { shopId } = req.user;
        const products = await Product.findAll({
            where: { shopId },
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { shopId } = req.user;

        const product = await Product.findOne({
            where: { id, shopId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { shopId } = req.user;
        const updates = req.body;

        const product = await Product.findOne({ where: { id, shopId } });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.update(updates);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { shopId } = req.user;

        const result = await Product.destroy({ where: { id, shopId } });

        if (!result) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

exports.bulkCreateProducts = async (req, res) => {
    try {
        const { shopId } = req.user;
        const products = req.body; // Expecting array

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'Invalid product list' });
        }

        // Map and validate
        const productsToCreate = products.map(p => ({
            ...p,
            shopId,
            stock: parseInt(p.stock) || 0,
            price: parseFloat(p.price) || 0,
            costPrice: parseFloat(p.costPrice) || 0
        }));

        const created = await Product.bulkCreate(productsToCreate);
        res.status(201).json(created);
    } catch (error) {
        console.error('Bulk Create Error:', error);
        res.status(500).json({ error: 'Failed to bulk create products' });
    }
};

exports.bulkUpdateProducts = async (req, res) => {
    try {
        const { shopId } = req.user;
        const updates = req.body; // Expecting array of { id, ...changes }

        if (!Array.isArray(updates)) {
            return res.status(400).json({ error: 'Invalid updates list' });
        }

        const promises = updates.map(async (update) => {
            if (!update.id) return;
            const { id, ...changes } = update;
            return Product.update(changes, { where: { id, shopId } });
        });

        await Promise.all(promises);
        res.json({ message: 'Bulk update successful' });
    } catch (error) {
        console.error('Bulk Update Error:', error);
        res.status(500).json({ error: 'Failed to bulk update products' });
    }
};
