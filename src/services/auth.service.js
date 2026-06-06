import api from './api';
export const authService = {
  login: (data) => api.post('/auth/login', { ...data, role: 'seller' }),
  googleLogin: (credential) => api.post('/auth/google-login', { credential, role: 'seller' }),
  register: (data) => api.post('/auth/register', { ...data, role: 'seller' }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  resetPassword: (data) => api.post('/auth/reset-password', { ...data, role: 'seller' }),
};
