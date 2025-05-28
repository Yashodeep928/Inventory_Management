const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Mock purchases data
const mockPurchases = [
  { _id: '1', name: 'Test Product 1', category: 'Electronics', price: 100, quantity: 5 },
  { _id: '2', name: 'Test Product 2', category: 'Clothing', price: 50, quantity: 10 }
];

// Purchase routes
app.get('/api/purchases/get', (req, res) => {
  console.log('GET /api/purchases/get called');
  res.json(mockPurchases);
});

app.post('/api/purchases/add', (req, res) => {
  console.log('POST /api/purchases/add called', req.body);
  const newPurchase = { 
    _id: Date.now().toString(),
    ...req.body
  };
  res.status(201).json(newPurchase);
});

app.put('/api/purchases/update/:id', (req, res) => {
  console.log('PUT /api/purchases/update/:id called', req.params.id, req.body);
  res.json({ ...req.body, _id: req.params.id });
});

app.put('/api/purchases/deactivate/:id', (req, res) => {
  console.log('PUT /api/purchases/deactivate/:id called', req.params.id);
  res.status(200).json({ message: 'Purchase deactivated successfully', id: req.params.id });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('  GET    /');
  console.log('  GET    /api/purchases/get');
  console.log('  POST   /api/purchases/add');
  console.log('  PUT    /api/purchases/update/:id');
  console.log('  PUT    /api/purchases/deactivate/:id');
}); 