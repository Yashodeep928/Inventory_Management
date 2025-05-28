import { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';
import { FiEdit, FiTrash2, FiPlus, FiRefreshCw, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import '../css/modal.css'; // We'll create this CSS file next

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
  });

  const [products, setProducts] = useState([]); // New state for product list
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    quantity: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        const res = await fetch('http://localhost:5000/api/purchases/get');
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to fetch products:', res.status, errorText);
          setError(`Failed to fetch products: ${res.status}`);
          return;
        }
        
        const data = await res.json();
        console.log('Products fetched:', data);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(`Network error: ${err.message}`);
      }
    };

    fetchProducts();
  }, []);

  // Handle update button click
  const handleUpdateClick = (product) => {
    setUpdateData({
      id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity
    });
    setShowUpdateModal(true);
  };

  // Handle change in update modal
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle update form submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`http://localhost:5000/api/purchases/update/${updateData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updateData.name,
          category: updateData.category,
          price: updateData.price,
          quantity: updateData.quantity
        }),
      });
      
      const data = await res.json();
      console.log(data);
      
      if (res.ok) {
        console.log("Product updated successfully");
        // Update products list
        setProducts(prev => 
          prev.map(product => 
            product._id === updateData.id ? {...product, ...updateData} : product
          )
        );
        
        // Close modal
        setShowUpdateModal(false);

        // Show success message
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Product updated successfully',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        console.log("Failed to update product");
        setError("Failed to update product: " + (data.message || res.statusText));
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Error updating product: " + err.message);
    }
  };

  // Handle product deactivation with confirmation
  const confirmDeactivate = (id, productName) => {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are about to deactivate <strong>${productName}</strong><br>This product will no longer be available in the inventory.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate it!',
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
        deactivateProduct(id, productName);
      }
    });
  };

  // Actual deactivation function
  const deactivateProduct = async (id, productName) => {
    console.log("Deactivating ID:", id);
    try {
      const res = await fetch(`http://localhost:5000/api/purchases/deactivate/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await res.json();
      console.log(data);
  
      if (res.status === 200) {
        console.log("Product deactivated successfully");
        setProducts((prev) => prev.filter((product) => product._id !== id));
        
        // Show success message
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: `${productName} deactivated`,
          text: 'The product has been successfully deactivated',
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        console.log("Failed to deactivate product");
        setError("Failed to deactivate product: " + (data.message || res.statusText));
        
        // Show error message
        Swal.fire({
          icon: 'error',
          title: 'Deactivation Failed',
          text: "Failed to deactivate product: " + (data.message || res.statusText)
        });
      }
    } catch (err) {
      console.error("Error deactivating product:", err);
      setError("Error deactivating product: " + err.message);
      
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error deactivating product: " + err.message
      });
    }
  };

  const handleChange = (e) => {
    const { value, placeholder } = e.target;
    setFormData((prev) => ({
      ...prev,
      [placeholder === 'Product Name' ? 'name'
       : placeholder === 'Category' ? 'category'
       : placeholder === 'Price' ? 'price'
       : 'quantity']: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formchadata = formData;
    const productData = {
      name: formchadata.name,
      category: formchadata.category,
      price: formchadata.price,
      quantity: formchadata.quantity
    };

    console.log(productData);

    try {
      const res = await fetch('http://localhost:5000/api/purchases/add',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      const data = await res.json();
      console.log(data);

      if (res.status === 201) {
        console.log("Product added successfully");
        setProducts((prev) => [...prev, {...productData, _id: data._id}]); // Add to product list with the new ID
        setFormData({ name: '', category: '', price: '', quantity: '' }); // Reset form
        setError(''); // Clear any errors
        
        // Show success message
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Product added successfully',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        console.log("Failed to add product");
        setError("Failed to add product: " + (data.message || res.statusText));
      }
    } catch (err) {
      console.error("Error adding product:", err);
      setError("Error adding product: " + err.message);
    }
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="container py-5">
        {/* Heading */}
        <div className="text-center mb-4">
          <h2 className="text-primary">Manage Products</h2>
        </div>

        {/* Error display */}
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

        {/* Add Product Form */}
        <div className="bg-white p-4 rounded shadow mb-5">
          <h4 className="mb-3">Add New Product</h4>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Initial Quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <FiPlus className="me-1" /> Add Product
            </button>
          </form>
        </div>

        {/* Products Table */}
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-3">Current Products</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-primary">
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="5" className="text-center">No products added yet.</td></tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>₹{product.price}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <button 
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleUpdateClick(product)}
                          title="Update Product"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => confirmDeactivate(product._id, product.name)}
                          title="Deactivate Product"
                        >
                          <FiTrash2 />
                        </button> 
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Update Modal with animation */}
        {showUpdateModal && (
          <div className="modal-backdrop fade-in" onClick={() => setShowUpdateModal(false)}>
            <div 
              className="modal-container"
              onClick={e => e.stopPropagation()} // Prevent clicks inside modal from closing it
            >
              <div className="modal-content scale-in">
                <div className="modal-header bg-warning text-white">
                  <h5 className="modal-title">Update Product</h5>
                  <button 
                    type="button" 
                    className="btn-close-custom" 
                    onClick={() => setShowUpdateModal(false)}
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <form onSubmit={handleUpdateSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={updateData.name}
                        onChange={handleUpdateChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={updateData.category}
                        onChange={handleUpdateChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Price</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={updateData.price}
                        onChange={handleUpdateChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={updateData.quantity}
                        onChange={handleUpdateChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-warning">
                      <FiRefreshCw className="me-1" /> Update Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
