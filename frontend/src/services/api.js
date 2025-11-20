import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Products
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// SKUs
export const skuAPI = {
  getAll: () => api.get('/skus'),
  getById: (id) => api.get(`/skus/${id}`),
  create: (data) => api.post('/skus', data),
  update: (id, data) => api.put(`/skus/${id}`, data),
  delete: (id) => api.delete(`/skus/${id}`),
};

// Inventory
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getBySKU: (sku_id) => api.get(`/inventory/${sku_id}`),
  update: (sku_id, data) => api.put(`/inventory/${sku_id}`, data),
  addMovement: (data) => api.post('/inventory/movements', data),
  getMovements: (sku_id) => api.get('/inventory/movements/list', { params: { sku_id } }),
  getBatches: (sku_id) => api.get('/inventory/batches/list', { params: { sku_id } }),
  createBatch: (data) => api.post('/inventory/batches', data),
  getAlerts: (is_resolved) => api.get('/inventory/alerts/list', { params: { is_resolved } }),
  resolveAlert: (id) => api.put(`/inventory/alerts/${id}/resolve`),
};

export default api;
