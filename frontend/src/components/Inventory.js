import React, { useState, useEffect } from 'react';
import { inventoryAPI, skuAPI } from '../services/api';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batches, setBatches] = useState([]);
  const [movementForm, setMovementForm] = useState({
    sku_id: '',
    movement_type: 'IN',
    quantity: '',
    reference_number: '',
    notes: '',
  });
  const [batchForm, setBatchForm] = useState({
    sku_id: '',
    batch_number: '',
    quantity: '',
    manufacturing_date: '',
    expiry_date: '',
    received_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchInventory();
    fetchSKUs();
    fetchBatches();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchSKUs = async () => {
    try {
      const response = await skuAPI.getAll();
      setSKUs(response.data);
    } catch (error) {
      console.error('Error fetching SKUs:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await inventoryAPI.getBatches();
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleMovementSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.addMovement(movementForm);
      setShowMovementModal(false);
      resetMovementForm();
      fetchInventory();
    } catch (error) {
      console.error('Error adding stock movement:', error);
      alert('Failed to add stock movement');
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.createBatch(batchForm);
      setShowBatchModal(false);
      resetBatchForm();
      fetchBatches();
      fetchInventory();
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Failed to create batch');
    }
  };

  const resetMovementForm = () => {
    setMovementForm({
      sku_id: '',
      movement_type: 'IN',
      quantity: '',
      reference_number: '',
      notes: '',
    });
  };

  const resetBatchForm = () => {
    setBatchForm({
      sku_id: '',
      batch_number: '',
      quantity: '',
      manufacturing_date: '',
      expiry_date: '',
      received_date: new Date().toISOString().split('T')[0],
    });
  };

  const getStockStatusBadge = (status) => {
    const badges = {
      IN_STOCK: 'badge-success',
      LOW_STOCK: 'badge-warning',
      OUT_OF_STOCK: 'badge-danger',
    };
    return badges[status] || 'badge-secondary';
  };

  const getBatchStatusBadge = (status) => {
    const badges = {
      VALID: 'badge-success',
      EXPIRING_SOON: 'badge-warning',
      EXPIRED: 'badge-danger',
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Inventory Management</h2>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => setShowMovementModal(true)}>
            Add Stock Movement
          </button>
          <button className="btn btn-success" onClick={() => setShowBatchModal(true)}>
            Add Batch
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Current Inventory Levels</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>SKU Code</th>
                <th>Product</th>
                <th>Variant</th>
                <th>Current Stock</th>
                <th>Min Level</th>
                <th>Max Level</th>
                <th>Status</th>
                <th>Selling Price</th>
                <th>Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <h3>No inventory records found</h3>
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.sku_code}</strong></td>
                    <td>{item.product_name}</td>
                    <td>{item.variant_name || '-'}</td>
                    <td><strong>{item.quantity}</strong></td>
                    <td>{item.minimum_stock_level}</td>
                    <td>{item.maximum_stock_level || '-'}</td>
                    <td>
                      <span className={`badge ${getStockStatusBadge(item.stock_status)}`}>
                        {item.stock_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>${parseFloat(item.selling_price).toFixed(2)}</td>
                    <td>
                      ${(item.quantity * parseFloat(item.selling_price)).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Inventory Batches</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Batch Number</th>
                <th>SKU Code</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Mfg Date</th>
                <th>Expiry Date</th>
                <th>Received Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No batches found</h3>
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id}>
                    <td><strong>{batch.batch_number}</strong></td>
                    <td>{batch.sku_code}</td>
                    <td>{batch.product_name}</td>
                    <td>{batch.quantity}</td>
                    <td>
                      {batch.manufacturing_date
                        ? new Date(batch.manufacturing_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      {batch.expiry_date
                        ? new Date(batch.expiry_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{new Date(batch.received_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${getBatchStatusBadge(batch.batch_status)}`}>
                        {batch.batch_status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Modal */}
      {showMovementModal && (
        <div className="modal-overlay" onClick={() => setShowMovementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Stock Movement</h2>
              <button className="close-btn" onClick={() => setShowMovementModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleMovementSubmit}>
              <div className="form-group">
                <label>SKU *</label>
                <select
                  value={movementForm.sku_id}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, sku_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select SKU</option>
                  {skus.map((sku) => (
                    <option key={sku.id} value={sku.id}>
                      {sku.sku_code} - {sku.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Movement Type *</label>
                  <select
                    value={movementForm.movement_type}
                    onChange={(e) =>
                      setMovementForm({ ...movementForm, movement_type: e.target.value })
                    }
                    required
                  >
                    <option value="IN">Stock In</option>
                    <option value="OUT">Stock Out</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={movementForm.quantity}
                    onChange={(e) =>
                      setMovementForm({ ...movementForm, quantity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reference Number</label>
                <input
                  type="text"
                  value={movementForm.reference_number}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, reference_number: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={movementForm.notes}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, notes: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMovementModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Batch</h2>
              <button className="close-btn" onClick={() => setShowBatchModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleBatchSubmit}>
              <div className="form-group">
                <label>SKU *</label>
                <select
                  value={batchForm.sku_id}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, sku_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select SKU</option>
                  {skus.map((sku) => (
                    <option key={sku.id} value={sku.id}>
                      {sku.sku_code} - {sku.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Batch Number *</label>
                  <input
                    type="text"
                    value={batchForm.batch_number}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, batch_number: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={batchForm.quantity}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, quantity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Manufacturing Date</label>
                  <input
                    type="date"
                    value={batchForm.manufacturing_date}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, manufacturing_date: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={batchForm.expiry_date}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, expiry_date: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Received Date</label>
                  <input
                    type="date"
                    value={batchForm.received_date}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, received_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBatchModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
