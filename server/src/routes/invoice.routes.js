const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken, requireShop } = require('../middleware/auth.middleware');
const { checkDemoLimit } = require('../middleware/demoMiddleware');

router.use(verifyToken);
router.use(requireShop);

router.post('/', checkDemoLimit('invoice'), invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);

module.exports = router;
