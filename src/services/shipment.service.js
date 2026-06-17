import api from './api';

export const shipmentService = {
  getSellerShipments: (params) => api.get('/shipments/seller', { params }),
  retryShipment: (id) => api.post(`/shipments/${id}/retry`),
  generateLabel: (id) => api.post(`/shipments/${id}/label`),
  generateInvoice: (id) => api.post(`/shipments/${id}/invoice`),
  generateManifest: (id) => api.post(`/shipments/${id}/manifest`),
  printDocuments: (id) => api.post(`/shipments/${id}/print-document`),
  getTrackingLogs: (awbCode) => api.get(`/shipments/track/${awbCode}`),
  getLogisticsAnalytics: (params) => api.get('/shipments/analytics', { params }),
  readyToShip: (id) => api.post(`/shipments/${id}/ready-to-ship`),
  selfShip: (id, data) => api.post(`/shipments/${id}/self-ship`, data),
  markInTransit: (id) => api.post(`/shipments/${id}/mark-in-transit`),
  markDelivered: (id) => api.post(`/shipments/${id}/mark-delivered`),
};
