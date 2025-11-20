import React, { useState, useEffect } from 'react';
import { productAPI, skuAPI, inventoryAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSKUs: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    unresolvedAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [productsRes, skusRes, inventoryRes, alertsRes] = await Promise.all([
        productAPI.getAll(),
        skuAPI.getAll(),
        inventoryAPI.getAll(),
        inventoryAPI.getAlerts(false),
      ]);

      const lowStock = inventoryRes.data.filter(
        (item) => item.stock_status === 'LOW_STOCK'
      ).length;

      const outOfStock = inventoryRes.data.filter(
        (item) => item.stock_status === 'OUT_OF_STOCK'
      ).length;

      setStats({
        totalProducts: productsRes.data.length,
        totalSKUs: skusRes.data.length,
        lowStockItems: lowStock,
        outOfStockItems: outOfStock,
        unresolvedAlerts: alertsRes.data.length,
      });

      setRecentAlerts(alertsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>

        <div className="stat-card">
          <h3>Total SKUs</h3>
          <div className="stat-value">{stats.totalSKUs}</div>
        </div>

        <div className="stat-card warning">
          <h3>Low Stock Items</h3>
          <div className="stat-value">{stats.lowStockItems}</div>
        </div>

        <div className="stat-card danger">
          <h3>Out of Stock</h3>
          <div className="stat-value">{stats.outOfStockItems}</div>
        </div>

        <div className="stat-card danger">
          <h3>Unresolved Alerts</h3>
          <div className="stat-value">{stats.unresolvedAlerts}</div>
        </div>
      </div>

      {recentAlerts.length > 0 && (
        <div className="card">
          <h3>Recent Stock Alerts</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Alert Type</th>
                  <th>Message</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.product_name}</td>
                    <td>{alert.sku_code}</td>
                    <td>
                      <span
                        className={`badge ${
                          alert.alert_type === 'OUT_OF_STOCK'
                            ? 'badge-danger'
                            : alert.alert_type === 'LOW_STOCK'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {alert.alert_type}
                      </span>
                    </td>
                    <td>{alert.message}</td>
                    <td>{new Date(alert.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
