import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProductsBarChart = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/purchases/all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Filter for only active products
        const activeProducts = data.filter(product => product.active);
        
        setProductData(activeProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product data');
        setLoading(false);
        toast.error('Failed to load product chart data');
      }
    };

    fetchProducts();
  }, []);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Product Inventory Levels',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Quantity: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          precision: 0 // Only show whole numbers
        }
      },
      x: {
        title: {
          display: true,
          text: 'Products',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  // Prepare chart data
  const chartData = {
    labels: productData.map(product => product.name),
    datasets: [
      {
        label: 'Quantity in Stock',
        data: productData.map(product => product.quantity),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      }
    ],
  };

  if (loading) {
    return <div className="text-center py-5">Loading product data...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">Error: {error}</div>;
  }

  if (productData.length === 0) {
    return <div className="text-center py-5">No products available to display</div>;
  }

  return (
    <div style={{ height: '400px' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default ProductsBarChart; 