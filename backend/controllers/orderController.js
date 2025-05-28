const Order = require('../models/orderModel');
const Purchase = require('../models/purchaseModel');
const Sale = require('../models/saleModel');

// Get user's orders
exports.getUserOrders = async (req, res) => {
  console.log('=== getUserOrders called ===');
  console.log('Request headers:', req.headers);
  console.log('Authorization header:', req.headers.authorization);
  
  try {
    console.log('Request user object:', req.user);
    
    // Get the user ID from the authenticated request
    if (!req.user) {
      console.error('No user in request');
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated',
        error: 'Missing user information in request'
      });
    }
    
    // Check if user ID exists
    if (!req.user._id) {
      console.error('User object exists but no _id field');
      console.error('User object contents:', JSON.stringify(req.user));
      return res.status(401).json({ 
        success: false,
        message: 'Invalid user information',
        error: 'User ID not found in request'
      });
    }

    const userId = req.user._id;
    console.log('Fetching orders for user ID:', userId);
    
    // Find orders for this user
    const orders = await Order.find({ userId })
      .sort({ orderDate: -1 })
      .lean() // Convert to plain JavaScript objects
      .exec();
       
    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    // If no orders found, return empty array instead of 404
    if (!orders || orders.length === 0) {
      console.log('No orders found for user (returning empty array)');
      return res.json([]);
    }
    
    // Log a sample order (first one) for debugging
    if (orders.length > 0) {
      console.log('Sample order:', {
        _id: orders[0]._id,
        userId: orders[0].userId,
        orderDate: orders[0].orderDate,
        productCount: orders[0].products?.length || 0
      });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error in getUserOrders:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...(error.errors && { errors: error.errors })
    });
    
    // More specific error handling
    let statusCode = 500;
    let errorMessage = 'Server Error';
    
    if (error.name === 'CastError') {
      statusCode = 400;
      errorMessage = 'Invalid user ID format';
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = 'Validation error';
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { customerName, contactInfo, products } = req.body;
    const userId = req.user._id; // Get user ID from authenticated request

    if (!customerName || !products || products.length === 0) {
      return res.status(400).json({ message: 'Customer name and at least one product are required' });
    }

    // Check product availability
    const unavailableProducts = [];
    
    // Check each product's quantity
    for (const item of products) {
      const product = await Purchase.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product with ID ${item.productId} not found` 
        });
      }
      
      if (product.quantity < item.quantity) {
        unavailableProducts.push({
          productId: item.productId,
          name: product.name,
          requestedQty: item.quantity,
          availableQty: product.quantity
        });
      }
    }

    // If any products are unavailable
    if (unavailableProducts.length > 0) {
      return res.status(400).json({
        message: 'Insufficient product quantity',
        unavailableProducts
      });
    }

    const newOrder = new Order({
      userId,
      customerName,
      contactInfo,
      products
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ message: 'Order status is required' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Process order and create sale
exports.processOrderToSale = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({ 
        message: `Order has already been ${order.orderStatus.toLowerCase()}` 
      });
    }
    
    // Check if products are still available
    const unavailableProducts = [];
    
    for (const item of order.products) {
      const product = await Purchase.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product with ID ${item.productId} not found` 
        });
      }
      
      if (product.quantity < item.quantity) {
        unavailableProducts.push({
          productId: item.productId,
          name: product.name,
          requestedQty: item.quantity,
          availableQty: product.quantity
        });
      }
    }
    
    if (unavailableProducts.length > 0) {
      return res.status(400).json({
        message: 'Insufficient product quantity',
        unavailableProducts
      });
    }
    
    // Create sale from order
    const totalAmount = order.products.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
    
    const newSale = new Sale({
      customerName: order.customerName,
      products: order.products,
      totalAmount,
      saleDate: new Date()
    });
    
    // Save sale record
    const savedSale = await newSale.save();
    
    // Update inventory quantities
    for (const item of order.products) {
      await Purchase.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } } // Decrement quantity
      );
    }
    
    // Update order status
    order.orderStatus = 'Processed';
    await order.save();
    
    res.status(200).json({ 
      message: 'Order processed and sale created successfully',
      order,
      sale: savedSale
    });
    
  } catch (error) {
    console.error('Error processing order to sale:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
