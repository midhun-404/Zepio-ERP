const { Invoice, Product } = require('../models');
const { Op } = require('sequelize');

const SUPER_OWNER_EMAIL = 'midhunlm65@gmail.com';

const DEMO_LIMITS = {
    SALES_PER_DAY: 15,
    PRODUCTS_PER_DAY: 5,
};

/**
 * Middleware to enforce demo limits for non-super-owners
 * @param {string} resourceType - 'invoice' | 'product'
 */
const checkDemoLimit = (resourceType) => async (req, res, next) => {
    try {
        const user = req.user;

        // 1. Bypass for Super Owner
        if (user && user.email === SUPER_OWNER_EMAIL) {
            return next();
        }

        // 2. Identify Shop
        const shopId = user.shopId;
        if (!shopId) {
            return res.status(400).json({ error: 'User not associated with a shop' });
        }

        // 3. Define "Today" (Server Time)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        let count = 0;
        let limit = 0;

        if (resourceType === 'invoice') {
            limit = DEMO_LIMITS.SALES_PER_DAY;
            count = await Invoice.count({
                where: {
                    shopId,
                    createdAt: { [Op.gte]: startOfDay }
                }
            });
        } else if (resourceType === 'product') {
            limit = DEMO_LIMITS.PRODUCTS_PER_DAY;
            count = await Product.count({
                where: {
                    shopId,
                    createdAt: { [Op.gte]: startOfDay }
                }
            });
        }

        // 4. Enforce Limit
        if (count >= limit) {
            return res.status(403).json({
                error: 'DEMO_LIMIT_EXCEEDED',
                message: `DEMO MODE LIMIT: You have reached the daily limit of ${limit} ${resourceType}s. Please upgrade to Pro for unlimited access.`
            });
        }

        next();
    } catch (error) {
        console.error('Demo Limit Check Error:', error);
        // Fallback: If check fails, allow action to avoid blocking valid usage due to bugs, 
        // but log critical error.
        next();
    }
};

module.exports = {
    checkDemoLimit,
    SUPER_OWNER_EMAIL
};
