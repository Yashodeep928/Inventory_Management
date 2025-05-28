import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const CategoryDoughnutChart = () => {
  const [categoryData, setCategoryData] = useState({});
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
        
        // Group products by category
        const categories = {};
        
        activeProducts.forEach(product => {
          if (!categories[product.category]) {
            categories[product.category] = 0;
          }
          categories[product.category] += 1;
        });
        
        setCategoryData(categories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data');
        setLoading(false);
        toast.error('Failed to load category chart data');
      }
    };

    fetchProducts();
  }, []);

  // Generate random colors for chart segments
  const generateColors = (count) => {
    const backgroundColors = [];
    const borderColors = [];
    
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      
      backgroundColors.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
      borderColors.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }
    
    return { backgroundColors, borderColors };
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Product Categories',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart._metasets[0].total;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const { backgroundColors, borderColors } = generateColors(labels.length);
    
    return {
      labels,
      datasets: [
        {
          label: 'Products by Category',
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        }
      ],
    };
  };

  if (loading) {
    return <div className="text-center py-5">Loading category data...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">Error: {error}</div>;
  }

  if (Object.keys(categoryData).length === 0) {
    return <div className="text-center py-5">No categories available to display</div>;
  }

  return (
    <div style={{ height: '300px' }}>
      <Doughnut options={options} data={prepareChartData()} />
    </div>
  );
};

export default CategoryDoughnutChart; 