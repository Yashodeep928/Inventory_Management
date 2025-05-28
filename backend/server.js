const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// const mongoose = require('mongoose');

const userRoutes = require('./routes/userRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const orderRoutes = require('./routes/orderRoutes');
const saleRoutes = require('./routes/saleRoutes');

// Initialize express
const app = express();

// Load environment variables
dotenv.config();
connectDB();

// Configure CORS - Simplified version
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Debug route
app.get('/api/debug', (req, res) => {
  res.json({ message: 'Debug endpoint is working' });
});

// Test route with parameter
app.get('/api/test/:id', (req, res) => {
  res.json({ message: 'Test parameter route', id: req.params.id });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', saleRoutes);

// 404 Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  
  // Handle path-to-regexp errors
  if (err.name === 'TypeError' && err.message.includes('Missing parameter name')) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'There is an issue with one of the API routes. Please check route definitions.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Handle other errors
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Connect to MongoDB
// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory');
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// connectDB();

// Output available routes from userRoutes file
console.log('\nAvailable User Routes:');
userRoutes.stack.forEach((r) => {
  if (r.route && r.route.path) {
    Object.keys(r.route.methods).forEach((method) => {
      console.log(`  ${method.toUpperCase().padEnd(6)} /api/users${r.route.path}`);
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`API routes available:`);
  console.log(`  GET    /`);
  console.log(`  GET    /api/debug`);
  console.log(`  GET    /api/purchases/get`);
  console.log(`  POST   /api/purchases/add`);
  console.log(`  PUT    /api/purchases/update/:id`);
  console.log(`  PUT    /api/purchases/deactivate/:id`);
});









