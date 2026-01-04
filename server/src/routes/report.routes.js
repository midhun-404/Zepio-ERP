const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, requireShop } = require('../middleware/auth.middleware');

router.use(verifyToken);
router.use(requireShop);

router.get('/dashboard', reportController.getDashboardStats);
router.get('/top-products', reportController.getTopProducts);

module.exports = router;
