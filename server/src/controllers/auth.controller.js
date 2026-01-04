const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Shop, User, sequelize } = require('../models');

const generateToken = (user) => {
    return jwt.sign(
        { userId: user.id, shopId: user.shopId, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

exports.signup = async (req, res) => {
    const { shopName, ownerName, email, password, phone, country, currency, currencySymbol } = req.body;

    try {
        // Check if email exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        // Transaction
        const result = await sequelize.transaction(async (t) => {
            // 1. Create Shop
            const shop = await Shop.create({
                name: shopName,
                ownerName,
                email,
                password: await bcrypt.hash(password, 10),
                phone,
                country,
                currency, // Save currency
                currencySymbol // Save symbol
            }, { transaction: t });

            // 2. Create Owner User
            const user = await User.create({
                shopId: shop.id,
                name: ownerName,
                email,
                password: await bcrypt.hash(password, 10),
                role: 'OWNER'
            }, { transaction: t });

            return { shop, user };
        });

        const token = generateToken(result.user);

        res.status(201).json({
            message: 'Shop created successfully',
            token,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                shopId: result.shop.id,
                shopName: result.shop.name,
                currency: result.shop.currency,
                currencySymbol: result.shop.currencySymbol,
                country: result.shop.country,
                isDemo: result.shop.isDemo
            }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'Registration failed.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Shop, as: 'shop' }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = generateToken(user);

        const isSuperOwner = user.email === 'midhunlm65@gmail.com';

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopId: user.shopId,
                shopName: user.shop.name,
                currency: user.shop.currency,
                currencySymbol: user.shop.currencySymbol,
                country: user.shop.country,
                isDemo: !isSuperOwner // Enforce demo for everyone else
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed.' });
    }
};
