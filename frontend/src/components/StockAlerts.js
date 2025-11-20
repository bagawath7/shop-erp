import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';

function StockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const isResolved = filter === 'resolved' ? true : false;
      const response = await inventoryAPI.getAlerts(isResolved);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      alert('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await inventoryAPI.resolveAlert(id);
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Failed to resolve alert');
    }
  };

  const getAlertTypeBadge = (type) => {
    const badges = {
      OUT_OF_STOCK: 'badge-danger',
      LOW_STOCK: 'badge-warning',
      EXPIRING_SOON: 'badge-info',
    };
    return badges[type] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading">Loading stock alerts...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Stock Alerts</h2>
        <div className="action-buttons">
          <button
            className={`btn ${filter === 'unresolved' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('unresolved')}
          >
            Unresolved
          </button>
          <button
            className={`btn ${filter === 'resolved' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
        </div>
      </div>

      {alerts.length > 0 && filter === 'unresolved' && (
        <div className="alert alert-warning">
          <strong>Attention!</strong> You have {alerts.length} unresolved stock alert(s) that require your attention.
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU Code</th>
              <th>Alert Type</th>
              <th>Message</th>
              <th>Current Stock</th>
              <th>Created</th>
              {filter === 'resolved' && <th>Resolved</th>}
              {filter === 'unresolved' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={filter === 'resolved' ? '7' : '7'} className="empty-state">
                  <div className="empty-state-icon">
                    {filter === 'unresolved' ? '✅' : '📋'}
                  </div>
                  <h3>
                    {filter === 'unresolved'
                      ? 'No unresolved alerts'
                      : 'No resolved alerts'}
                  </h3>
                  <p>
                    {filter === 'unresolved'
                      ? 'Great! All stock alerts have been resolved.'
                      : 'Resolved alerts will appear here.'}
                  </p>
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.product_name}</td>
                  <td><strong>{alert.sku_code}</strong></td>
                  <td>
                    <span className={`badge ${getAlertTypeBadge(alert.alert_type)}`}>
                      {alert.alert_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{alert.message}</td>
                  <td>
                    <strong>
                      {alert.current_quantity !== null ? alert.current_quantity : 'N/A'}
                    </strong>
                  </td>
                  <td>{new Date(alert.created_at).toLocaleString()}</td>
                  {filter === 'resolved' && (
                    <td>
                      {alert.resolved_at
                        ? new Date(alert.resolved_at).toLocaleString()
                        : '-'}
                    </td>
                  )}
                  {filter === 'unresolved' && (
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockAlerts;
