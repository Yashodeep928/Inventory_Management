import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { useNavigate} from 'react-router-dom';
import '../css/userDashboard.css'; // custom CSS
import Sidebar from './Sidebar';
import Navbar from './Navbar';


const UserDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: '', price: 0 }]);
  const [orders, setOrders] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Token exists:', !!token);
    console.log('User role:', userRole);
    
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/purchases/all');
        const data = await res.json();
        const activeProducts = data.filter(p => p.active && p.quantity > 0);
        setProducts(activeProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        toast.error('Failed to load products');
      }
    };

    fetchProducts();
  }, [refreshKey]);

  // Function to fetch user's orders
  const fetchOrders = async () => {
    setLoading(true);
    console.log('Fetching user orders...');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const userRole = localStorage.getItem('userRole');
      console.log('Attempting to fetch orders with token and role:', { tokenExists: !!token, userRole });
      
      const response = await fetch('http://localhost:5000/api/orders/user-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Orders data received:', data);
      
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error in fetchOrders:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      if (err.message.includes('401') || err.message.includes('token')) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        toast.dismiss('fetch-orders-error');
        toast.error('Your session has expired. Please log in again.', {
          toastId: 'session-expired'
        });
      } else {
        toast.dismiss('fetch-orders-error');
        toast.error(`Failed to load orders: ${err.message}`, {
          toastId: 'fetch-orders-error'
        });
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount and when refreshKey changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchOrders();
    } else {
      console.log('No token found, redirecting to login');
      navigate('/login');
    }
  }, [navigate, refreshKey]);

  // Handle order item change
  const handleOrderItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][field] = value;
    
    if (field === 'productId') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        updatedItems[index].price = selectedProduct.price;
      }
    }
    
    setOrderItems(updatedItems);
  };

  // Add another product to the order
  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: '', price: 0 }]);
  };

  // Remove an item from the order
  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      const updatedItems = [...orderItems];
      updatedItems.splice(index, 1);
      setOrderItems(updatedItems);
    }
  };

  // Calculate order total
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p._id === item.productId);
      const price = product ? product.price : 0;
      const quantity = item.quantity ? parseInt(item.quantity) : 0;
      return total + (price * quantity);
    }, 0).toFixed(2);
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactInfo && !emailRegex.test(contactInfo)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!customerName) {
      toast.error('Please enter customer name');
      return;
    }

    const validItems = orderItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one product with quantity');
      return;
    }

    const formattedItems = validItems.map(item => {
      const product = products.find(p => p._id === item.productId);
      return {
        productId: item.productId,
        name: product.name,
        quantity: parseInt(item.quantity),
        price: product.price
      };
    });

    const orderData = {
      customerName,
      contactInfo: contactInfo || 'Not provided',
      products: formattedItems,
      orderStatus: 'Pending' // Explicitly set status
    };

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.unavailableProducts) {
          const errorMessages = responseData.unavailableProducts.map(p => 
            `${p.name}: Requested ${p.requestedQty}, Available ${p.availableQty}`
          ).join('\n');
          
          toast.error(`Insufficient inventory: \n${errorMessages}`, {
            autoClose: 5000
          });
          throw new Error(responseData.message);
        }
        
        throw new Error(responseData.message || 'Failed to create order');
      }
      
      // Reset form
      setOrderItems([{ productId: '', quantity: '', price: 0 }]);
      setCustomerName('');
      setContactInfo('');
      
      // Refresh orders list
      await fetchOrders();
      
      toast.success('Order created successfully!', {
        autoClose: 3000,
        position: 'top-center'
      });
    } catch (err) {
      console.error('Error creating order:', err);
      if (!err.message.includes('Insufficient inventory')) {
        toast.error(`Error: ${err.message}`, {
          autoClose: 5000,
          position: 'top-center'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate order total for display
  const calculateOrderTotal = (order) => {
    if (!order.products || !Array.isArray(order.products)) return '0.00';
    return order.products.reduce((total, p) => total + (p.price * p.quantity), 0).toFixed(2);
  };

  return (
    <div className="user-dashboard">
      {/* Top Navbar */}

      <Navbar/>
     

      {/* Layout */}
      <div className="d-flex">
        {/* Sidebar */}
        <Sidebar/>
        

        {/* Main Content */}
        <div className="main-content flex-grow-1 p-5">
          <h2 className="mb-4">Welcome Back!</h2>

          {/* Create Order Form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4 className="card-title mb-3">Create New Order</h4>
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Customer Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Customer Name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="your@email.com"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                    />
                  </div>
                </div>

                {/* Product Selection */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Products*</label>
                  
                  {orderItems.map((item, index) => (
                    <div key={index} className="row g-2 mb-2 align-items-end border-bottom pb-2">
                      <div className="col-md-5">
                        <label className="form-label small">Product</label>
                        <select
                          className="form-select"
                          required
                          value={item.productId}
                          onChange={(e) => handleOrderItemChange(index, 'productId', e.target.value)}
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} - ₹{product.price} (Available: {product.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Quantity</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Qty"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleOrderItemChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Price</label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="text"
                            className="form-control"
                            disabled
                            value={item.price || '0.00'}
                          />
                        </div>
                      </div>
                      <div className="col-md-1">
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeOrderItem(index)}
                          disabled={orderItems.length <= 1}
                          title="Remove Item"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="d-flex justify-content-between mt-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={addOrderItem}
                    >
                      <FiPlus className="me-1" /> Add Another Product
                    </button>
                    <div className="fs-5">
                      <strong>Total: ₹{calculateTotal()}</strong>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Create Order'}
                </button>
              </form>
            </div>
          </div>

          {/* My Orders Table */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">My Orders</h4>
              
              {loading && <p className="text-center">Loading orders...</p>}
              
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className="table-primary">
                    <tr>
                      <th>Order Date</th>
                      <th>Products</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!Array.isArray(orders) || orders.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">No orders found.</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id} className={
                          order.orderStatus === 'Processed' ? 'table-success' : 
                          order.orderStatus === 'Cancelled' ? 'table-danger' : ''
                        }>
                          <td>{formatDate(order.orderDate)}</td>
                          <td>
                            <ul className="list-unstyled mb-0">
                              {Array.isArray(order.products) && order.products.map((p, i) => (
                                <li key={i}>
                                  {p.name} x {p.quantity} 
                                  <small className="text-muted"> ₹{p.price ? (p.price * p.quantity).toFixed(2) : 'N/A'}</small>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="fw-bold">
                            ₹{calculateOrderTotal(order)}
                          </td>
                          <td>
                            <span className={`badge rounded-pill d-inline-flex align-items-center ${
                              order.orderStatus === 'Processed' 
                                ? 'bg-success' 
                                : order.orderStatus === 'Cancelled'
                                  ? 'bg-danger'
                                  : 'bg-warning'
                            }`} style={{ minWidth: '90px', justifyContent: 'center' }}>
                              {order.orderStatus || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
