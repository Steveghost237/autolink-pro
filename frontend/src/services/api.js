import axios from 'axios';

// URL de l'API — configurable via .env (REACT_APP_API_URL)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// Injecte le token JWT sur chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autolink_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Déconnexion auto si token expiré
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && localStorage.getItem('autolink_refresh')) {
      try {
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: localStorage.getItem('autolink_refresh'),
        });
        localStorage.setItem('autolink_access', data.access);
        err.config.headers.Authorization = `Bearer ${data.access}`;
        return api.request(err.config);
      } catch (_) {
        localStorage.removeItem('autolink_access');
        localStorage.removeItem('autolink_refresh');
        localStorage.removeItem('autolink_user');
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/users/login/', { email, password }),
  register: (payload) => api.post('/users/register/', payload),
  google: (payload) => api.post('/users/google/', payload),
  me: () => api.get('/users/me/'),
};

export const vehiclesAPI = {
  list: (params) => api.get('/vehicles/', { params }),
  getAll: (params) => api.get('/vehicles/', { params }),
  detail: (id) => api.get(`/vehicles/${id}/`),
  create: (payload) => api.post('/vehicles/', payload),
  update: (id, payload) => api.patch(`/vehicles/${id}/`, payload),
};

export const bookingsAPI = {
  list: (params) => api.get('/bookings/', { params }),
  getAll: (params) => api.get('/bookings/', { params }),
  detail: (id) => api.get(`/bookings/${id}/`),
  create: (payload) => api.post('/bookings/', payload),
  update: (id, payload) => api.patch(`/bookings/${id}/`, payload),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/`, { status }),
  stats: () => api.get('/bookings/stats/'),
};

export const usersAPI = {
  list: (params) => api.get('/users/', { params }),
  getAll: (params) => api.get('/users/', { params }),
  update: (id, payload) => api.patch(`/users/${id}/`, payload),
};

export const walletAPI = {
  get: () => api.get('/payments/wallet/'),
  topup: (amount, method, phone) => api.post('/payments/wallet/topup/', { amount, method, phone }),
};

export default api;
