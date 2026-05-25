import api from './api';

export const returnService = {
  getSellerReturns: () => api.get('/returns/seller'),
  updateReturnStatus: (id, data) => api.put(`/returns/${id}/status/seller`, data),
};
