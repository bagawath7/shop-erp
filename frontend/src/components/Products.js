import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    skus: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSKU = () => {
    setFormData((prev) => ({
      ...prev,
      skus: [
        ...prev.skus,
        {
          sku_code: '',
          variant_name: '',
          cost_price: '',
          selling_price: '',
          tax_percentage: '',
          initial_quantity: 0,
          minimum_stock_level: 10,
        },
      ],
    }));
  };

  const handleSKUChange = (index, field, value) => {
    setFormData((prev) => {
      const newSkus = [...prev.skus];
      newSkus[index][field] = value;
      return { ...prev, skus: newSkus };
    });
  };

  const handleRemoveSKU = (index) => {
    setFormData((prev) => ({
      ...prev,
      skus: prev.skus.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProduct) {
        await productAPI.update(currentProduct.id, formData);
      } else {
        await productAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      skus: [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      skus: [],
    });
    setCurrentProduct(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Add New Product
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>SKUs Count</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <h3>No products found</h3>
                  <p>Add your first product to get started</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category_name || '-'}</td>
                  <td>{product.skus ? product.skus.length : 0}</td>
                  <td>{product.description || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(product.id)}
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
              <h2>{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              {!currentProduct && (
                <>
                  <div className="form-group">
                    <label>SKUs</label>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleAddSKU}
                    >
                      Add SKU
                    </button>
                  </div>

                  {formData.skus.map((sku, index) => (
                    <div key={index} className="card" style={{ marginBottom: '15px' }}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>SKU Code *</label>
                          <input
                            type="text"
                            value={sku.sku_code}
                            onChange={(e) =>
                              handleSKUChange(index, 'sku_code', e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Variant Name</label>
                          <input
                            type="text"
                            value={sku.variant_name}
                            onChange={(e) =>
                              handleSKUChange(index, 'variant_name', e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Cost Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={sku.cost_price}
                            onChange={(e) =>
                              handleSKUChange(index, 'cost_price', e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Selling Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={sku.selling_price}
                            onChange={(e) =>
                              handleSKUChange(index, 'selling_price', e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Tax %</label>
                          <input
                            type="number"
                            step="0.01"
                            value={sku.tax_percentage}
                            onChange={(e) =>
                              handleSKUChange(index, 'tax_percentage', e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Initial Quantity</label>
                          <input
                            type="number"
                            value={sku.initial_quantity}
                            onChange={(e) =>
                              handleSKUChange(index, 'initial_quantity', e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Min Stock Level</label>
                          <input
                            type="number"
                            value={sku.minimum_stock_level}
                            onChange={(e) =>
                              handleSKUChange(
                                index,
                                'minimum_stock_level',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleRemoveSKU(index)}
                      >
                        Remove SKU
                      </button>
                    </div>
                  ))}
                </>
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
                  {currentProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
