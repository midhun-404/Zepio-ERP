/**
 * ZEPIO ERP - Server Entry Point
 * 
 * @module App
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const reportRoutes = require('./routes/report.routes');
const settingsRoutes = require('./routes/settings.routes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/purchases', require('./routes/purchase.routes'));

// Serve static files in production
// console.log(`STRICT NODE_ENV: '${process.env.NODE_ENV}'`);
// if (process.env.NODE_ENV === 'production') {
if (true) {
    const path = require('path');
    const clientDist = path.join(__dirname, '../../client/dist');

    app.use(express.static(clientDist));

    app.use((req, res, next) => {
        // console.log('Fallback hit for:', req.url);
        res.sendFile('index.html', { root: clientDist }, (err) => {
            if (err) {
                console.error('SendFile error:', err);
                next(err);
            }
        });
    });
}



/**
 * Health Check Endpoint
 */
app.get('/', (req, res) => {
    res.json({
        project: 'ZEPIO ERP',
        status: 'Running',
        version: '1.0.0',
        mode: process.env.NODE_ENV || 'development'
    });
});


/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start Server
if (require.main === module) {
    const { sequelize } = require('./models');

    sequelize.sync().then(() => {
        console.log('Database synced');
        app.listen(PORT, () => {
            console.log(`\n🚀 ZEPIO ERP Backend running on http://localhost:${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }).catch(err => {
        console.error('Failed to sync db:', err);
    });
}

module.exports = app;
