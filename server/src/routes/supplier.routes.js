const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { verifyToken, requireShop, restrictDemo } = require('../middleware/auth.middleware');

router.use(verifyToken);
router.use(requireShop);

router.post('/', restrictDemo, supplierController.createSupplier);
router.get('/', supplierController.getSuppliers);
router.put('/:id', restrictDemo, supplierController.updateSupplier);
router.delete('/:id', restrictDemo, supplierController.deleteSupplier);

module.exports = router;
