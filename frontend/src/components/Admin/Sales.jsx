import { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [saleHistory, setSaleHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch products and sale history on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsRes = await fetch('http://localhost:5000/api/purchases/all');
        if (!productsRes.ok) {
          throw new Error(`Error fetching products: ${productsRes.statusText}`);
        }
        const productsData = await productsRes.json();
        setProducts(productsData);
        
        // Fetch sales history
        const salesRes = await fetch('http://localhost:5000/api/sales/all');
        if (!salesRes.ok) {
          throw new Error(`Error fetching sales: ${salesRes.statusText}`);
        }
        const salesData = await salesRes.json();
        setSaleHistory(salesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to fetch data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    const selectedProduct = products.find(p => p._id === selectedProductId);
    if (!selectedProduct) {
      setError("Product not found");
      return;
    }
    
    // Check if quantity is available
    if (selectedProduct.quantity < parseInt(quantity)) {
      setError(`Only ${selectedProduct.quantity} units available in stock`);
      return;
    }

    const saleData = {
      customerName: "Walk-in", // later make this dynamic
      products: [
        {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          quantity: parseInt(quantity),
          price: selectedProduct.price
        }
      ],
      totalAmount: selectedProduct.price * parseInt(quantity)
    };

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/sales/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      const data = await res.json();
      
      if (res.ok) {
        // Refresh sales history
        const salesRes = await fetch('http://localhost:5000/api/sales/all');
        const salesData = await salesRes.json();
        setSaleHistory(salesData);
        
        // Refresh products to get updated quantities
        const productsRes = await fetch('http://localhost:5000/api/purchases/all');
        const productsData = await productsRes.json();
        setProducts(productsData);
        
        setTotalPrice(saleData.totalAmount);
        setQuantity('');
        setSelectedProductId('');
        console.log("Sale recorded successfully");
      } else {
        setError(data.message || "Failed to record sale");
        console.log("Failed to record sale:", data);
      }
    } catch (err) {
      setError(`Error recording sale: ${err.message}`);
      console.error("Error recording sale:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price based on selected product and quantity
  const calculateTotal = () => {
    if (!selectedProductId || !quantity) return 0;
    const product = products.find(p => p._id === selectedProductId);
    return product ? product.price * parseInt(quantity || 0) : 0;
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="py-5">
        <div id="sales" className="container">
          <div className="text-center mb-4">
            <h2 className="h3 fw-semibold text-dark">Sales</h2>
          </div>

          {error && (
            <div className="alert alert-danger mb-4">
              {error}
              <button 
                type="button" 
                className="btn-close float-end" 
                onClick={() => setError('')}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Sale Form */}
          <form className="bg-white p-4 rounded shadow mb-4" onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <select
                  className="form-select"
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={loading}
                >
                  <option value="" disabled>Select Product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id} disabled={product.quantity <= 0}>
                      {product.name} ({product.quantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Quantity"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={loading}
                  min="1"
                  max={selectedProductId ? products.find(p => p._id === selectedProductId)?.quantity : 999}
                />
              </div>

              <div className="col-md-4 d-flex align-items-center">
                <p className="mb-0 fw-bold">
                  Total Price: ₹{calculateTotal()}
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Record Sale'}
            </button>
          </form>

          {/* Sales Table */}
          <div className="bg-white p-4 rounded shadow table-responsive">
            <h4 className="mb-3">Sales History</h4>
            {loading && <p>Loading...</p>}
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price per Unit</th>
                  <th>Total Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {saleHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No sales recorded yet</td>
                  </tr>
                ) : (
                  saleHistory.map((sale) => (
                    sale.products.map((product, idx) => (
                      <tr key={`${sale._id}-${idx}`}>
                        <td>{product.name}</td>
                        <td>{product.quantity}</td>
                        <td>₹{product.price}</td>
                        <td>₹{sale.totalAmount}</td>
                        <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
