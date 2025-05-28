const express = require('express');
const router = express.Router();
const { 
  getAllOrders, 
  createOrder, 
  updateOrderStatus, 
  getOrderById,
  deleteOrder,
  processOrderToSale,
  getUserOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/checkAuth');

// Get all orders (admin only)
router.get('/all', protect, getAllOrders);

// Get user's orders (authenticated users)
router.get('/user-orders', protect, getUserOrders);

// Get a single order by ID
router.get('/:id', protect, getOrderById);

// Create a new order (authenticated users)
router.post('/add', protect, createOrder);

// Update order status (admin only)
router.put('/status/:id', protect, updateOrderStatus);

// Process order to sale (admin only)
router.post('/process-to-sale/:orderId', protect, processOrderToSale);

// Delete an order (admin only)
router.delete('/:id', protect, deleteOrder);

module.exports = router;
