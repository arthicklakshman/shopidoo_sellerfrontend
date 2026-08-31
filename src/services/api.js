import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' }, withCredentials: true });

api.interceptors.response.use(
 response => response,
  error => {
    if (!error.response) {
      return Promise.reject(new Error('check your network '));
    }
    if (error.response?.status === 503) {
       window.location.href="/maintenance";
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sellerAccessToken');
  
  // 🌟 FIX: Do not send the old token if we are trying to register or login!
  const isAuthRoute = config.url.includes('/auth/register') || config.url.includes('/auth/login');
  
  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    
    // Skip token refresh for auth endpoints to preserve original 401 errors
    const isAuthRoute = orig.url?.includes('/auth/login') || 
                        orig.url?.includes('/auth/register') || 
                        orig.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !orig._retry && !isAuthRoute) {
      if (isRefreshing) return new Promise((res, rej) => failedQueue.push({ resolve: res, reject: rej })).then((t) => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });
      orig._retry = true; isRefreshing = true;
           try {
        const { data } = await api.post('/auth/refresh-token');
        const newToken = data.data.accessToken;
        localStorage.setItem('sellerAccessToken', newToken);
        processQueue(null, newToken);
        orig.headers.Authorization = `Bearer ${newToken}`;
        return api(orig);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('sellerAccessToken');
        
        // Prevent hard redirect loop to login if we are already on auth or onboarding pages
        const publicAuthPaths = ['/login', '/register', '/forgot-password'];
        const isAuthOrOnboarding = publicAuthPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/onboarding');

        if (!isAuthOrOnboarding) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Authentication expired'));
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default api;
