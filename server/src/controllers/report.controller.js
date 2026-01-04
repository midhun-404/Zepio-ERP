const { sequelize, Invoice, InvoiceItem, Product, Payment, Customer } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const { shopId } = req.user;
        const deadStockDays = 30; // TODO: Fetch from shop config

        const { startDate, endDate } = req.query;

        // Date Filtering Logic - Local Time
        // Date Filtering Logic - Local Time
        let start = new Date(new Date().setHours(0, 0, 0, 0));
        let end = new Date(new Date().setHours(23, 59, 59, 999));

        if (startDate && startDate !== 'undefined' && startDate !== 'null') {
            const parsedStart = new Date(startDate);
            if (!isNaN(parsedStart.getTime())) start = parsedStart;
        }

        if (endDate && endDate !== 'undefined' && endDate !== 'null') {
            const parsedEnd = new Date(endDate);
            if (!isNaN(parsedEnd.getTime())) end = parsedEnd;
        }

        const dateFilter = {
            [Op.between]: [start, end]
        };

        // 1. Sales & Invoices (Range)
        const salesData = await Invoice.findOne({
            where: { shopId, date: dateFilter },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSales'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'invoiceCount']
            ],
            raw: true
        });

        // Independent 30-Day Sales for Health Score (Momentum)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentMomentumData = await Invoice.findOne({
            where: {
                shopId,
                date: { [Op.gte]: thirtyDaysAgo }
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSales']
            ],
            raw: true
        });
        const last30DaysSales = recentMomentumData && recentMomentumData.totalSales ? Number(recentMomentumData.totalSales) : 0;

        // Safe Defaults
        const totalSales = salesData && salesData.totalSales ? Number(salesData.totalSales) : 0;
        const invoiceCount = salesData && salesData.invoiceCount ? Number(salesData.invoiceCount) : 0;

        // 2. Pending Payments (All Time)
        const allTimeSalesResult = await Invoice.sum('totalAmount', { where: { shopId } });
        const allTimePaymentsResult = await Payment.sum('amount', { where: { shopId } });

        const allTimeSales = Number(allTimeSalesResult || 0);
        const allTimePayments = Number(allTimePaymentsResult || 0);
        const pendingPayments = Math.max(0, allTimeSales - allTimePayments);

        // 3. Low Stock Items
        const lowStockCount = await Product.count({
            where: {
                shopId,
                stock: { [Op.lte]: 5 }
            }
        });

        // 4. Dead Stock
        const inactivityDate = new Date();
        inactivityDate.setDate(inactivityDate.getDate() - deadStockDays);

        const activeProductIdsItems = await InvoiceItem.findAll({
            where: { createdAt: { [Op.gte]: inactivityDate } },
            attributes: ['productId'],
            group: ['productId'],
            raw: true,
            include: [{ model: Product, as: 'product', where: { shopId }, attributes: [] }]
        });

        const activeProductIds = activeProductIdsItems.map(i => i.productId);

        const deadStockItems = await Product.findAll({
            where: {
                shopId,
                id: { [Op.notIn]: activeProductIds },
                stock: { [Op.gt]: 0 },
                createdAt: { [Op.lte]: inactivityDate }
            },
            attributes: ['id', 'name', 'price', 'stock', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        const deadStockCount = deadStockItems.length;
        const totalDeadStockValue = deadStockItems.reduce((acc, item) => acc + (Number(item.price || 0) * item.stock), 0);
        const specificDeadStockItem = deadStockItems.length > 0 ? deadStockItems[0] : null;

        // 5. Avg Bill Value
        const avgBillValue = invoiceCount > 0 ? (totalSales / invoiceCount) : 0;

        // 6. Health Score
        let healthScore = 0;
        // Sales Activity (Momentum - Last 30 Days)
        // Sales Activity (Momentum - Last 30 Days)
        // Target: 2000 currency units per month for max points (40)
        const salesTarget = 2000;
        const salesPoints = Math.min(40, (last30DaysSales / salesTarget) * 40);
        healthScore += salesPoints;

        if (allTimeSales > 0 && last30DaysSales === 0) healthScore += 5; // Small bonus for existence

        // Pending Ratio
        // Penalty logic: 0 pending = 30 points. 100% pending = 0 points.
        const pendingRatio = allTimeSales > 0 ? (pendingPayments / allTimeSales) : 0;
        const pendingPoints = Math.max(0, 30 - (pendingRatio * 100)); // Linear decay
        healthScore += pendingPoints;

        // Inventory Health
        const totalProducts = await Product.count({ where: { shopId } });
        const deadStockRatio = totalProducts > 0 ? (deadStockCount / totalProducts) : 0;

        if (totalProducts > 0) {
            // Dead Stock Ratio: 0% dead = 30 points. >30% dead starts hitting 0.
            // Formula: 30 * (1 - (deadStockRatio / 0.3)) restricted to 0-30 range.
            const inventoryPoints = Math.max(0, 30 * (1 - (deadStockRatio / 0.3)));
            healthScore += inventoryPoints;
        } else {
            // New shop bonus (Neutral start)
            healthScore += 15;
        }

        // 7. Recent Sales (Last 5)
        const recentSales = await Invoice.findAll({
            where: { shopId },
            include: [{ model: Customer, as: 'customer', attributes: ['name'] }],
            order: [['date', 'DESC']],
            limit: 5
        });

        // 8. Top Products (By Quantity Sold in Date Range)
        const topProducts = await InvoiceItem.findAll({
            where: {
                createdAt: dateFilter // Apply filter to see top products for selected period
            },
            attributes: [
                'productId',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
                [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
            ],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['name', 'price'],
                where: { shopId }
            }],
            group: ['productId'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 5
        });

        // Final Response Structure
        res.json({
            range: { start, end },
            sales: {
                total: totalSales,
                count: invoiceCount,
                average: avgBillValue
            },
            pendingPayments,
            lowStock: {
                count: lowStockCount
            },
            healthScore: Math.round(Math.min(100, healthScore)),
            deadStock: {
                count: deadStockCount,
                value: totalDeadStockValue,
                daysThreshold: deadStockDays,
                data: deadStockItems.slice(0, 10), // Send first 10 for display
                example: specificDeadStockItem ? {
                    name: specificDeadStockItem.name,
                    days: Math.floor((new Date() - new Date(specificDeadStockItem.createdAt)) / (1000 * 60 * 60 * 24))
                } : null
            },
            recentSales,
            topProducts
        });

    } catch (error) {
        console.error('Stats Error:', error);
        // Return fallback data structure on error to prevent frontend crash
        console.error('Stats Error (Returning Fallback):', error);
        res.json({
            range: {},
            sales: { total: 0, count: 0, average: 0 },
            pendingPayments: 0,
            lowStock: { count: 0 },
            healthScore: 0,
            deadStock: { count: 0, value: 0, data: [] },
            recentSales: [],
            topProducts: []
        });
    }
};

exports.getTopProducts = async (req, res) => {
    // ... existing code ...
    try {
        const { shopId } = req.user;
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const topProducts = await InvoiceItem.findAll({
            where: {
                createdAt: dateFilter // Apply date filter to items too? Yes.
            },
            attributes: [
                'productId',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
                [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
            ],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['name', 'price'],
                where: { shopId }
            }],
            group: ['productId'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 5
        });

        res.json(topProducts);
    } catch (error) {
        console.error('Top Products Error:', error);
        res.status(500).json({ error: 'Failed to fetch top products' });
    }
};
