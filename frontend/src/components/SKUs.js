import React, { useState, useEffect } from 'react';
import { skuAPI, productAPI } from '../services/api';

function SKUs() {
  const [skus, setSKUs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentSKU, setCurrentSKU] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    sku_code: '',
    variant_name: '',
    cost_price: '',
    selling_price: '',
    tax_percentage: 0,
    initial_quantity: 0,
    minimum_stock_level: 10,
  });

  useEffect(() => {
    fetchSKUs();
    fetchProducts();
  }, []);

  const fetchSKUs = async () => {
    try {
      setLoading(true);
      const response = await skuAPI.getAll();
      setSKUs(response.data);
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      alert('Failed to fetch SKUs');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSKU) {
        await skuAPI.update(currentSKU.id, formData);
      } else {
        await skuAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchSKUs();
    } catch (error) {
      console.error('Error saving SKU:', error);
      alert('Failed to save SKU');
    }
  };

  const handleEdit = (sku) => {
    setCurrentSKU(sku);
    setFormData({
      product_id: sku.product_id,
      sku_code: sku.sku_code,
      variant_name: sku.variant_name || '',
      cost_price: sku.cost_price,
      selling_price: sku.selling_price,
      tax_percentage: sku.tax_percentage || 0,
      initial_quantity: sku.quantity || 0,
      minimum_stock_level: sku.minimum_stock_level || 10,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this SKU?')) {
      try {
        await skuAPI.delete(id);
        fetchSKUs();
      } catch (error) {
        console.error('Error deleting SKU:', error);
        alert('Failed to delete SKU');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      sku_code: '',
      variant_name: '',
      cost_price: '',
      selling_price: '',
      tax_percentage: 0,
      initial_quantity: 0,
      minimum_stock_level: 10,
    });
    setCurrentSKU(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const calculateMargin = (cost, selling) => {
    if (!cost || !selling) return '-';
    const margin = ((selling - cost) / selling) * 100;
    return `${margin.toFixed(2)}%`;
  };

  const calculatePriceWithTax = (price, tax) => {
    if (!price || !tax) return parseFloat(price).toFixed(2);
    return (parseFloat(price) * (1 + parseFloat(tax) / 100)).toFixed(2);
  };

  if (loading) {
    return <div className="loading">Loading SKUs...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>SKUs</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Add New SKU
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>SKU Code</th>
              <th>Product</th>
              <th>Variant</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Tax %</th>
              <th>Price (incl. Tax)</th>
              <th>Margin</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skus.length === 0 ? (
              <tr>
                <td colSpan="11" className="empty-state">
                  <div className="empty-state-icon">🏷️</div>
                  <h3>No SKUs found</h3>
                  <p>Add your first SKU to get started</p>
                </td>
              </tr>
            ) : (
              skus.map((sku) => (
                <tr key={sku.id}>
                  <td><strong>{sku.sku_code}</strong></td>
                  <td>{sku.product_name}</td>
                  <td>{sku.variant_name || '-'}</td>
                  <td>${parseFloat(sku.cost_price).toFixed(2)}</td>
                  <td>${parseFloat(sku.selling_price).toFixed(2)}</td>
                  <td>{sku.tax_percentage}%</td>
                  <td>
                    ${calculatePriceWithTax(sku.selling_price, sku.tax_percentage)}
                  </td>
                  <td>{calculateMargin(sku.cost_price, sku.selling_price)}</td>
                  <td>{sku.quantity || 0}</td>
                  <td>
                    <span
                      className={`badge ${
                        sku.is_active ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {sku.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(sku)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(sku.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{currentSKU ? 'Edit SKU' : 'Add New SKU'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product *</label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  required
                  disabled={currentSKU}
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SKU Code *</label>
                  <input
                    type="text"
                    name="sku_code"
                    value={formData.sku_code}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Variant Name</label>
                  <input
                    type="text"
                    name="variant_name"
                    value={formData.variant_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cost Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Selling Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tax Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    name="tax_percentage"
                    value={formData.tax_percentage}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {!currentSKU && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Initial Quantity</label>
                    <input
                      type="number"
                      name="initial_quantity"
                      value={formData.initial_quantity}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Stock Level</label>
                    <input
                      type="number"
                      name="minimum_stock_level"
                      value={formData.minimum_stock_level}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentSKU ? 'Update' : 'Create'} SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SKUs;
