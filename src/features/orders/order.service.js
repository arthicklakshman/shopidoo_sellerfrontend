import axios from 'axios';

// 🔹 Base URL (use env in real projects)
const API_URL = 'http://localhost:5000/api/v1/orders';

// 🔹 Create axios instance (clean + reusable)
const api = axios.create({
  baseURL: API_URL,
});

// 🔹 Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Common error handler
const handleError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    return Promise.reject(error.response.data);
  }

  return Promise.reject({ message: 'Network Error' });
};

// ✅ Fetch Seller Orders (with pagination support)
export const getSellerOrders = async (params = {}) => {
  try {
    const response = await api.get('/seller', {
      params, // { page, limit, status }
    });

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// ✅ (Optional) Fetch single order details
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/seller/${orderId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// ✅ (Optional) Update order status
export const updateOrderStatus = async (orderId, payload) => {
  try {
    const response = await api.put(`/seller/${orderId}`, payload);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// ✅ Export all as default (optional pattern)
export default {
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
};