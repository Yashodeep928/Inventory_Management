const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase, updatePurchase, deactivatePurchase, getAllPurchases } = require('../controllers/purchaseController');

router.get('/get', getPurchases);
router.get('/all', getAllPurchases);
router.post('/add', createPurchase);
router.put('/update/:id', updatePurchase);
router.put('/deactivate/:id', deactivatePurchase);

module.exports = router;