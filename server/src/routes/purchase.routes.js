const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const { verifyToken, requireShop, restrictDemo } = require('../middleware/auth.middleware');

router.use(verifyToken);
router.use(requireShop);

router.post('/', restrictDemo, purchaseController.createPO);
router.get('/', purchaseController.getPOs);
router.post('/:id/receive', restrictDemo, purchaseController.receivePO);

module.exports = router;
