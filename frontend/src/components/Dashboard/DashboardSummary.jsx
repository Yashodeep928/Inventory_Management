import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const DashboardSummary = () => {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('http://localhost:5000/api/purchases/all');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        
        // Fetch orders
        const ordersResponse = await fetch('http://localhost:5000/api/orders/all');
        let ordersData = [];
        if (ordersResponse.ok) {
          ordersData = await ordersResponse.json();
        }
        
        // Calculate summary metrics
        const activeProducts = productsData.filter(product => product.active);
        const uniqueCategories = new Set(activeProducts.map(p => p.category));
        const lowStockItems = activeProducts.filter(p => p.quantity < 10); // Consider items with less than 10 as low stock
        
        setSummary({
          totalProducts: activeProducts.length,
          totalCategories: uniqueCategories.size,
          lowStockProducts: lowStockItems.length,
          totalOrders: ordersData.length
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching summary data:', err);
        toast.error('Failed to load dashboard summary');
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return (
      <div className="row g-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total Products',
      value: summary.totalProducts,
      icon: 'bi-box',
      color: 'primary'
    },
    {
      title: 'Product Categories',
      value: summary.totalCategories,
      icon: 'bi-tags',
      color: 'success'
    },
    {
      title: 'Low Stock Items',
      value: summary.lowStockProducts,
      icon: 'bi-exclamation-triangle',
      color: 'warning'
    },
    {
      title: 'Total Orders',
      value: summary.totalOrders,
      icon: 'bi-cart',
      color: 'info'
    }
  ];

  return (
    <div className="row g-4">
      {summaryCards.map((card, index) => (
        <div key={index} className="col-md-3">
          <div className={`card shadow-sm h-100 border-${card.color}`}>
            <div className="card-body text-center">
              <i className={`bi ${card.icon} text-${card.color} fs-1 mb-2`}></i>
              <h5 className="card-title">{card.title}</h5>
              <h2 className={`display-4 fw-bold text-${card.color}`}>{card.value}</h2>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardSummary; 

