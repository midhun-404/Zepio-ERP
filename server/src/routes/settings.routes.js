const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { verifyToken, requireShop } = require('../middleware/auth.middleware');

router.use(verifyToken);
router.use(requireShop);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/reset', settingsController.resetShopData);
router.delete('/account', settingsController.deleteAccount);

module.exports = router;
