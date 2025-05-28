import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../shared/Navbar';
import { FiCheck, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/orders/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshKey]);

  // Process Order to Sale
  const handleProcessToSale = async (orderId, customerName) => {
    // Show confirmation dialog
    Swal.fire({
      title: 'Process Order to Sale?',
      html: `Are you sure you want to process order for <strong>${customerName}</strong>?<br>This will create a sale and update inventory.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, process it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-wide',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel'
      },
      buttonsStyling: true,
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        processOrderToSale(orderId);
      }
    });
  };

  // Actual processing function
  const processOrderToSale = async (orderId) => {
    setProcessingOrderId(orderId);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/process-to-sale/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle inventory errors
        if (responseData.unavailableProducts) {
          const errorMessages = responseData.unavailableProducts.map(p => 
            `${p.name}: Requested ${p.requestedQty}, Available ${p.availableQty}`
          ).join('\n');
          
          toast.error(`Cannot process order - insufficient inventory: \n${errorMessages}`, {
            autoClose: 5000
          });
          throw new Error(responseData.message);
        }
        
        throw new Error(responseData.message || 'Failed to process order');
      }
      
      // Refresh data
      setRefreshKey(old => old + 1);
      
      // Success message
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Order Processed',
        text: 'Order has been processed and sale created successfully',
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      console.error('Error processing order:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus, customerName) => {
    // Show confirmation dialog for cancelling
    if (newStatus === 'Cancelled') {
      Swal.fire({
        title: 'Cancel Order?',
        html: `Are you sure you want to cancel order for <strong>${customerName}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it',
        customClass: {
          popup: 'swal-wide',
          title: 'swal-title',
          htmlContainer: 'swal-text',
          confirmButton: 'swal-confirm',
          cancelButton: 'swal-cancel'
        },
        buttonsStyling: true,
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          updateOrderStatus(orderId, newStatus);
        }
      });
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  // Actual status update function
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      // Refresh orders
      setRefreshKey(old => old + 1);
      
      // Success message
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Order Updated',
        text: `Order ${newStatus.toLowerCase()} successfully`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error(`Failed to update order: ${err.message}`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Content */}
      <div className="container py-5">
        {/* Heading */}
        <div className="text-center mb-4">
          <h2 className="text-primary">Orders Management</h2>
          <p className="text-muted">Manage and process customer orders</p>
        </div>

        {/* Orders Table */}
        <div className="table-responsive bg-white p-4 rounded shadow">
          <h4 className="mb-3">Order List</h4>
          
          {loading && <p className="text-center">Loading orders...</p>}
          
          <table className="table table-bordered table-striped">
            <thead className="table-primary">
              <tr>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className={order.orderStatus === 'Processed' ? 'table-success' : 
                                                order.orderStatus === 'Cancelled' ? 'table-danger' : ''}>
                    <td>
                      <div>{order.customerName}</div>
                      <small className="text-muted">{order.contactInfo}</small>
                    </td>
                    <td>
                      <ul className="list-unstyled mb-0">
                        {order.products.map((p, i) => (
                          <li key={i}>
                            {p.name} x {p.quantity} 
                            <small className="text-muted"> ₹{p.price ? (p.price * p.quantity).toFixed(2) : 'N/A'}</small>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      ₹{order.products.reduce((total, p) => total + (p.price * p.quantity), 0).toFixed(2)}
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <span className={`badge ${
                        order.orderStatus === 'Processed' 
                          ? 'bg-success' 
                          : order.orderStatus === 'Cancelled'
                            ? 'bg-danger'
                            : 'bg-warning'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      {order.orderStatus === 'Pending' && (
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleProcessToSale(order._id, order.customerName)}
                            disabled={processingOrderId === order._id}
                            title="Process & Create Sale"
                          >
                            {processingOrderId === order._id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <FiCheck />
                            )}
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusUpdate(order._id, 'Cancelled', order.customerName)}
                            disabled={processingOrderId === order._id}
                            title="Cancel Order"
                          >
                            <FiX />
                          </button>
                        </div>
                      )}
                      {order.orderStatus !== 'Pending' && (
                        <small className="text-muted">No actions available</small>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
