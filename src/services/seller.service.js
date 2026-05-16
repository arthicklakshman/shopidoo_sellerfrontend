// import api from './api';
// export const sellerService = {
//   getDashboard: () => api.get('/seller/dashboard'),
//   getProducts: (params) => api.get('/seller/products', { params }),
//   getOrders: (params) => api.get('/seller/orders', { params }),
//   getSupportTickets: () => api.get('/support'),
//   getSupportTicket: (id) => api.get(`/support/${id}`),
//   createSupportTicket: (data) => api.post('/support', data),
//   deleteSupportTicket: (id) => api.delete(`/support/${id}`),
//   createProduct: (data) => api.post('/products', data),
//   updateProduct: (id, data) => api.put(`/products/${id}`, data),
//   deleteProduct: (id) => api.delete(`/products/${id}`),
//   addImages: (id, formData) => api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
//   removeImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
//   updateOrderItemStatus: (itemId, status) => api.patch(`/seller/orders/${itemId}/status`, { status }),
//   getCategories: () => api.get('/categories'),
// };
import api from './api';

export const sellerService = {
  getDashboard: () => api.get('/seller/dashboard'),
  getProducts: (params) => api.get('/seller/products', { params }),
  getOrders: (params) => api.get('/seller/orders', { params }),
  getSupportTickets: () => api.get('/support'),
  getSupportTicket: (id) => api.get(`/support/${id}`),
  createSupportTicket: (data) => api.post('/support', data),
  deleteSupportTicket: (id) => api.delete(`/support/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addImages: (id, formData) =>
    api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removeImage: (productId, imageId) =>
    api.delete(`/products/${productId}/images/${imageId}`),
  updateOrderItemStatus: (itemId, status) =>
    api.patch(`/seller/orders/${itemId}/status`, { status }),
  getCategories: () => api.get('/categories'),
  getCategoryAttributes: (categoryId) => api.get(`/categories/${categoryId}/attributes`),

  getCoupons: () => api.get('/coupons/admin'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),

  toggleAllProductsVisibility: () =>
    api.patch('/products/seller/products/toggle-visibility'),
  toggleProductVisibility: (id) =>
    api.patch(`/products/${id}/toggle-visibility`),
 
};
