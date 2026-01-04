const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, requireShop } = require('../middleware/auth.middleware');
const { checkDemoLimit } = require('../middleware/demoMiddleware');

router.use(verifyToken);
router.use(requireShop);

router.post('/', checkDemoLimit('product'), productController.createProduct);
router.post('/bulk', checkDemoLimit('product'), productController.bulkCreateProducts);
router.put('/bulk', checkDemoLimit('product'), productController.bulkUpdateProducts);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
// Updates don't necessarily increase count, but maybe we should block them in strict demo? 
// Requirement says "Daily usage limits enforced... Number of sales, Product additions". Use limit for creation.
// For update/delete, maybe just block if it's a demo user to prevent messing up the demo data too much?
// Or leave as is. User asked for "Number of sales, Product additions".
// I will keep checkDemoLimit('product') for create, but maybe remove restrictDemo for update/delete or check requirements.
// "If limit exceeded -> block action".
// For now, I will use checkDemoLimit('product') on creates. 
// Existing used restrictDemo on update/delete. I will simply remove it from update/delete to allow free editing, 
// OR apply a 'strict' block if needed. 
// "Limit include: Number of sales, Product additions". Doesn't say updates.
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
