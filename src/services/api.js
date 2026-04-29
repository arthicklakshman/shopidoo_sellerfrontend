import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' }, withCredentials: true });

api.interceptors.response.use(
 response => response,
 error => {
   if (error.response?.status === 503) {
      window.location.href="/maintenance";
   }
   return Promise.reject(error);
 }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sellerAccessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) return new Promise((res, rej) => failedQueue.push({ resolve: res, reject: rej })).then((t) => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });
      orig._retry = true; isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('sellerRefreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
        const newToken = data.data.accessToken;
        localStorage.setItem('sellerAccessToken', newToken);
        if (data.data.refreshToken) localStorage.setItem('sellerRefreshToken', data.data.refreshToken);
        processQueue(null, newToken);
        orig.headers.Authorization = `Bearer ${newToken}`;
        return api(orig);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('sellerAccessToken');
        localStorage.removeItem('sellerRefreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default api;
