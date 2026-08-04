
import api from './api';

export const sellerService = {
  getDashboard: () => api.get('/seller/dashboard'),
  getProducts: (params) => api.get('/seller/products', { params }),
  getReviews: ({ page = 1, limit = 15, status = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  return api.get(`/seller/reviews?${params.toString()}`);
  },

  replyToReview: (reviewId, reply) =>
  api.post(`/seller/reviews/${reviewId}/reply`, { reply }),

  deleteReview: (reviewId) =>
  api.delete(`/seller/reviews/${reviewId}`),
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
  getProduct: (id) => api.get(`/products/${id}`),

  getCoupons: () => api.get('/coupons/admin'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),

  toggleAllProductsVisibility: () =>
    api.patch('/products/seller/products/toggle-visibility'),
  toggleProductVisibility: (id) =>
    api.patch(`/products/${id}/toggle-visibility`),
  
  uploadImage: (formData, type = '') => {
    const url = type ? `/uploads/image?type=${type}` : '/uploads/image';
    return api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

    getBanners: () => api.get('/banners'),

  createBanner: (data) =>
    api.post('/banners', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateBanner: (id, data) =>
    api.put(`/banners/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteBanner: (id) => api.delete(`/banners/${id}`),
  addTicketMessage: (id, message) => api.post(`/support/${id}/messages`, { message }),
};

