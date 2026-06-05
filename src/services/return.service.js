import api from './api';

export const returnService = {
  getSellerReturns: () => api.get('/returns/seller'),
  updateReturnStatus: (id, data) => api.put(`/returns/${id}/status/seller`, data),
  submitInspection: (id, data) => api.post(`/returns/${id}/inspection`, data),
  processRefund: (id, data) => api.post(`/returns/${id}/refund`, data),
  uploadProof: (formData) => api.post('/uploads/proof', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSellerMetrics: () => api.get('/returns/seller/metrics'),
};
