// services/quick.service.js — seller panel API calls for QUICK / Minutes
import api from './api';

export const quickService = {
  dashboard: (params) => api.get('/quick/seller/dashboard', { params }),
  areas: () => api.get('/quick/seller/service-areas'),
  config: () => api.get('/quick/seller/config'),

  products: (params) => api.get('/quick/seller/products', { params }),
  saveListing: (productId, data) => api.put(`/quick/seller/products/${productId}`, data),

  inventory: () => api.get('/quick/seller/inventory'),
  updateStock: (productId, quick_stock) => api.patch(`/quick/seller/inventory/${productId}`, { quick_stock }),

  orders: (params) => api.get('/quick/seller/orders', { params }),
  // Status changes go through your EXISTING seller endpoint so settlement,
  // notifications and wallet logic keep working exactly as for Shopidoo orders.
  updateItemStatus: (itemId, status) => api.patch(`/seller/orders/${itemId}/status`, { status }),

  returns: () => api.get('/quick/seller/returns'),
};
