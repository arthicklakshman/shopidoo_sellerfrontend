import api from './api';

const AUTH_API = '/auth';

export const authService = {
  // --- CORE AUTHENTICATION ---
  login: async (data) => await api.post(`${AUTH_API}/login`, data),

  // 🌟 ADDED: Google Login specifically tagged for sellers
  googleLogin: async (token) => await api.post(`${AUTH_API}/google`, { token, loginType: 'seller' }),
  
  register: async (data) => await api.post(`${AUTH_API}/register`, { ...data, role: 'seller' }),
  
  logout: async () => await api.post(`${AUTH_API}/logout`),
  
  getMe: async () => await api.get(`${AUTH_API}/me`),

  // --- OTP VERIFICATION (Universal) ---
  // Expects: { email: '...' } OR { mobile: '...' }
  sendOtp: async (data) => await api.post(`${AUTH_API}/send-otp`, data),
  
  // Expects: { email: '...', otp: '...' } OR { mobile: '...', otp: '...' }
  verifyOtp: async (data) => await api.post(`${AUTH_API}/verify-otp`, data),

  // --- PASSWORD MANAGEMENT ---
  // Expects: { currentPassword: '...', newPassword: '...' }
  changePassword: async (data) => await api.put(`${AUTH_API}/change-password`, data),
  
  // Expects: { emailId: '...', mobileNumber: '...', newPassword: '...' }
  resetPassword: async (data) => await api.post(`${AUTH_API}/reset-password`, data),
};




// import api from './api';

// const AUTH_API = '/auth';

// export const authService = {
//   // --- CORE AUTHENTICATION ---
//   login: async (data) => await api.post(`${AUTH_API}/login`, data),
  
//   register: async (data) => await api.post(`${AUTH_API}/register`, { ...data, role: 'seller' }),
  
//   logout: async () => await api.post(`${AUTH_API}/logout`),
  
//   getMe: async () => await api.get(`${AUTH_API}/me`),

//   // --- OTP VERIFICATION (Universal) ---
//   // Expects: { email: '...' } OR { mobile: '...' }
//   sendOtp: async (data) => await api.post(`${AUTH_API}/send-otp`, data),
  
//   // Expects: { email: '...', otp: '...' } OR { mobile: '...', otp: '...' }
//   verifyOtp: async (data) => await api.post(`${AUTH_API}/verify-otp`, data),

//   // --- PASSWORD MANAGEMENT ---
//   // Expects: { currentPassword: '...', newPassword: '...' }
//   changePassword: async (data) => await api.put(`${AUTH_API}/change-password`, data),
  
//   // Expects: { emailId: '...', mobileNumber: '...', newPassword: '...' }
//   resetPassword: async (data) => await api.post(`${AUTH_API}/reset-password`, data),
// };



// import api from './api';
// export const authService = {
//   login: (data) => api.post('/auth/login', data),
//   register: (data) => api.post('/auth/register', { ...data, role: 'seller' }),
//   logout: () => api.post('/auth/logout'),
//   getMe: () => api.get('/auth/me'),
// };
