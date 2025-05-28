import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ProductsBarChart from '../Charts/ProductsBarChart';
import CategoryDoughnutChart from '../Charts/CategoryDoughnutChart';
import DashboardSummary from '../Dashboard/DashboardSummary';
import Navbar from '../shared/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AdminDashboard mounted or location changed');
    
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      console.log('AdminDashboard checkAuth - Token exists:', !!token);
      console.log('Current token value:', token);
      
      if (!token) {
        console.log('No token found, redirecting to login page');
        navigate("/login");
      } else {
        console.log('Token found, staying on dashboard');
      }
    };

    checkAuth();

    // 👇 Listen to location changes (like forward/back)
    console.log('Setting up popstate listener');
    
    const handlePopState = () => {
      console.log('Browser navigation detected (back/forward)');
      checkAuth();
    };
    
    window.addEventListener("popstate", handlePopState);

    // Cleanup event
    return () => {
      console.log('Cleaning up popstate listener');
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location, navigate]); // Add navigate to dependency array

  const handleLogout = () => {
    console.log('Logout button clicked');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    console.log('Token after removal:', localStorage.getItem('token'));
    navigate('/');
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Content */}
      <div id="dashboard" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary">Inventory Dashboard</h2>
          <p className="text-muted">Overview of your inventory status and statistics</p>
        </div>

        {/* Summary Cards */}
        <section className="mb-5">
          <DashboardSummary />
        </section>

        {/* Charts */}
        <div className="row g-4 mb-5">
          {/* Bar Chart - Product Quantities */}
          <div className="col-lg-8">
            <div className="card shadow h-100">
              <div className="card-body">
                <h3 className="card-title text-primary mb-4">Product Inventory Levels</h3>
                <ProductsBarChart />
              </div>
            </div>
          </div>
          
          {/* Doughnut Chart - Categories */}
          <div className="col-lg-4">
            <div className="card shadow h-100">
              <div className="card-body">
                <h3 className="card-title text-primary mb-4">Product Categories</h3>
                <CategoryDoughnutChart />
              </div>
            </div>
          </div>
        </div>
        
        {/* Low Stock Products Alert */}
        <div className="card shadow mt-4 border-warning">
          <div className="card-header bg-warning text-white">
            <h3 className="m-0">Low Stock Alert</h3>
          </div>
          <div className="card-body">
            <LowStockProducts navigate={navigate} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to display low stock products
const LowStockProducts = ({ navigate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/purchases/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        const activeProducts = data.filter(p => p.active);
        
        // Get products with quantity less than 10
        const lowStockItems = activeProducts
          .filter(p => p.quantity < 10)
          .sort((a, b) => a.quantity - b.quantity); // Sort by quantity (lowest first)
        
        setProducts(lowStockItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching low stock products:', err);
        setLoading(false);
      }
    };

    fetchLowStockProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-3">Loading low stock products...</div>;
  }

  if (products.length === 0) {
    return <div className="alert alert-success">All products are well-stocked!</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Current Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>
                <span className={`badge bg-${product.quantity <= 5 ? 'danger' : 'warning'}`}>
                  {product.quantity} left
                </span>
              </td>
              <td>
                <Link 
                  to="/add-product" 
                  className="btn btn-sm btn-outline-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    // Store the product ID in localStorage for the AddProduct page
                    localStorage.setItem('restockProductId', product._id);
                    navigate('/add-product');
                  }}
                >
                  Restock
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
