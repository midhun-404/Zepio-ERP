const jwt = require('jsonwebtoken');
const { Shop } = require('../models');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token.' });
    }
};

const requireShop = (req, res, next) => {
    if (!req.user || !req.user.shopId) {
        return res.status(403).json({ error: 'Shop context missing.' });
    }
    next();
};

const restrictDemo = async (req, res, next) => {
    if (req.user.email === 'midhunlm65@gmail.com') {
        return next();
    }

    const shop = await Shop.findByPk(req.user.shopId);

    if (!shop || !shop.isDemo) {
        return next();
    }

    const LIMITS = {
        PRODUCTS: 10,
        BILLS_PER_DAY: 5,
        REPORTS_PER_DAY: 1
    };

    req.shopConstraints = LIMITS;
    req.isDemo = true;
    next();
};

module.exports = { verifyToken, requireShop, restrictDemo };
