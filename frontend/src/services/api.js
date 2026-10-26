import axios from 'axios';

// URL de l'API — priorité à REACT_APP_API_URL (build), sinon déduction au
// runtime : sur *.worldwide-international.business → sous-domaine api-,
// ailleurs (local) → localhost:8000.
function resolveApiUrl() {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  const host = window.location.hostname.replace(/^www\./, '');
  if (host.endsWith('.worldwide-international.business')) {
    return `https://api-${host}/api`;
  }
  return 'http://localhost:8000/api';
}
const API_URL = resolveApiUrl();

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
  otpRequest: (payload) => api.post('/users/otp/request/', payload),
  otpVerify: (email, code) => api.post('/users/otp/verify/', { email, code }),
  me: () => api.get('/users/me/'),
};

export const vehiclesAPI = {
  list: (params) => api.get('/vehicles/', { params }),
  getAll: (params) => api.get('/vehicles/', { params }),
  detail: (id) => api.get(`/vehicles/${id}/`),
  create: (payload) => api.post('/vehicles/', payload),
  update: (id, payload) => api.patch(`/vehicles/${id}/`, payload),
  delete: (id) => api.delete(`/vehicles/${id}/`),
  uploadMedia: (id, payload) => api.post(`/vehicles/${id}/media/`, payload),
  media: (id) => api.get(`/vehicles/${id}/media/`),
  deleteMedia: (id, mediaId) => api.delete(`/vehicles/${id}/media/${mediaId}/`),
  facets: () => api.get('/vehicles/facets/'),
  favorites: () => api.get('/vehicles/favorites/'),
  addFavorite: (vehicle) => api.post('/vehicles/favorites/', { vehicle }),
  removeFavorite: (vehicle) => api.delete(`/vehicles/favorites/${vehicle}/`),
};

export const bookingsAPI = {
  list: (params) => api.get('/bookings/', { params }),
  getAll: (params) => api.get('/bookings/', { params }),
  detail: (id) => api.get(`/bookings/${id}/`),
  create: (payload) => api.post('/bookings/', payload),
  update: (id, payload) => api.patch(`/bookings/${id}/`, payload),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/`, { status }),
  dispute: (id, reason) => api.post(`/bookings/${id}/dispute/`, { reason }),
  resolveDispute: (id, decision) => api.post(`/bookings/${id}/resolve-dispute/`, { decision }),
  stats: () => api.get('/bookings/stats/'),
  clientStats: () => api.get('/bookings/client-stats/'),
  receipt: (id) => api.get(`/bookings/${id}/receipt/`, { responseType: 'blob' }),
  emailReceipt: (id) => api.post(`/bookings/${id}/receipt/email/`),
};

export const notificationsAPI = {
  list: (params) => api.get('/users/notifications/', { params }),
  readAll: () => api.post('/users/notifications/read/'),
  read: (id) => api.post(`/users/notifications/${id}/read/`),
};

export const siteAPI = {
  config: () => api.get('/site-config/'),
};

export const contactAPI = {
  send: (payload) => api.post('/contact/', payload),
};

export const contactMessagesAPI = {
  list: (params) => api.get('/contact/messages/', { params }),
  update: (id, payload) => api.patch(`/contact/messages/${id}/`, payload),
  delete: (id) => api.delete(`/contact/messages/${id}/`),
};

export const newsletterAPI = {
  campaigns: (params) => api.get('/users/newsletter/campaigns/', { params }),
  send: (payload) => api.post('/users/newsletter/send/', payload),
};

export const usersAPI = {
  list: (params) => api.get('/users/', { params }),
  getAll: (params) => api.get('/users/', { params }),
  update: (id, payload) => api.patch(`/users/${id}/`, payload),
  me: () => api.get('/users/me/'),
  updateMe: (payload) => api.patch('/users/me/', payload),
};

export const walletAPI = {
  get: () => api.get('/payments/wallet/'),
  topup: (amount, method, phone) => api.post('/payments/wallet/topup/', { amount, method, phone }),
};

export default api;
