const { sequelize, Invoice, InvoiceItem, Product, Payment, Customer, Shop } = require('../models');

exports.createInvoice = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { customerName, customerPhone, items, discount, paymentMode, paymentAmount, status } = req.body;
        const { shopId, isDemo, shopConstraints } = req.user;

        // Default status logic
        // If status passed explicitly (HELD, QUOTATION), respecting it.
        // Otherwise calculate based on payment.
        let invoiceStatus = status || 'PAID';
        const paidAmt = Number(paymentAmount) || 0;

        // Demo Mode Check: Limit bills per day
        if (isDemo && invoiceStatus !== 'QUOTATION' && invoiceStatus !== 'HELD') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const billsToday = await Invoice.count({
                where: { shopId, date: { [sequelize.Op.gte]: todayStart }, status: { [sequelize.Op.notIn]: ['HELD', 'QUOTATION'] } }
            });
            if (billsToday >= shopConstraints.BILLS_PER_DAY) {
                throw new Error('Demo Mode Limit: Max 5 bills per day allowed.');
            }
        }

        // 1. Find or Create Customer
        let customer = null;
        if (customerName) {
            [customer] = await Customer.findOrCreate({
                where: { phone: customerPhone, shopId },
                defaults: { name: customerName, shopId },
                transaction
            });
        }

        // 2. Calculate Totals & Deduct Stock
        let totalAmount = 0;
        const invoiceItemsData = [];

        for (const item of items) {
            const product = await Product.findOne({ where: { id: item.productId, shopId }, transaction });

            if (!product) throw new Error(`Product not found: ${item.productId}`);

            // Only deduct stock if it's a real sale
            if (invoiceStatus !== 'QUOTATION' && invoiceStatus !== 'HELD') {
                if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
                await product.update({ stock: product.stock - item.quantity }, { transaction });
            }

            const itemTotal = Number(product.price) * item.quantity;
            totalAmount += itemTotal;

            invoiceItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
                total: itemTotal
            });
        }

        const finalAmount = totalAmount - (discount || 0);

        // Auto-status for sales
        if (!status) {
            if (paidAmt >= finalAmount) invoiceStatus = 'PAID';
            else if (paidAmt > 0) invoiceStatus = 'PARTIAL';
            else invoiceStatus = 'DUE';
        }

        // 3. Create Invoice
        const shop = await Shop.findByPk(shopId);
        const prefix = invoiceStatus === 'QUOTATION' ? 'QTN' : 'INV';
        const invoiceNumber = `${prefix}-${Date.now().toString().slice(-6)}`;

        const invoice = await Invoice.create({
            shopId,
            customerId: customer?.id,
            invoiceNumber,
            totalAmount: finalAmount,
            discount,
            paidAmount: paidAmt,
            status: invoiceStatus,
            paymentMode
        }, { transaction });

        // 4. Create Invoice Items
        await InvoiceItem.bulkCreate(
            invoiceItemsData.map(item => ({ ...item, invoiceId: invoice.id })),
            { transaction }
        );

        // 5. Record Payment (Only if real money received)
        if (paidAmt > 0 && invoiceStatus !== 'HELD' && invoiceStatus !== 'QUOTATION') {
            await Payment.create({
                shopId,
                customerId: customer?.id,
                amount: paidAmt,
                mode: paymentMode,
                type: 'IN',
                reference: invoice.invoiceNumber,
                date: new Date()
            }, { transaction });
        }

        await transaction.commit();

        // Fetch complete invoice with items for response
        const fullInvoice = await Invoice.findByPk(invoice.id, {
            include: ['items', 'customer']
        });

        res.status(201).json(fullInvoice);

    } catch (error) {
        await transaction.rollback();
        console.error('Create Invoice Error:', error);
        res.status(400).json({ error: error.message || 'Failed to create invoice' });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const { shopId } = req.user;
        const invoices = await Invoice.findAll({
            where: { shopId },
            include: [
                'customer',
                { model: InvoiceItem, as: 'items', include: ['product'] } // Nested include to get product names if association exists
            ],
            order: [['date', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};
