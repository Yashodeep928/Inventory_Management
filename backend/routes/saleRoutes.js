const express = require('express');
const router = express.Router();
const { createSale, getAllSales, getSaleById } = require('../controllers/saleController');

// Create a new sale
router.post('/new', createSale);

// Get all sales
router.get('/all', getAllSales);

// Get sale by ID
router.get('/:id', getSaleById);

module.exports = router;