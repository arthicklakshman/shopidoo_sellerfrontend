import api from './api';
export const sellerService = {
  getDashboard: () => api.get('/seller/dashboard'),
  getProducts: (params) => api.get('/seller/products', { params }),
  getOrders: (params) => api.get('/seller/orders', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addImages: (id, formData) => api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
  updateOrderItemStatus: (itemId, status) => api.patch(`/seller/orders/${itemId}/status`, { status }),
  getCategories: () => api.get('/categories'),
};
