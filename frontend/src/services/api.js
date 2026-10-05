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
};

export const notificationsAPI = {
  list: () => api.get('/users/notifications/'),
  readAll: () => api.post('/users/notifications/read/'),
  read: (id) => api.post(`/users/notifications/${id}/read/`),
};

export const usersAPI = {
  list: (params) => api.get('/users/', { params }),
  getAll: (params) => api.get('/users/', { params }),
  create: (payload) => api.post('/users/', payload),
  update: (id, payload) => api.patch(`/users/${id}/`, payload),
  me: () => api.get('/users/me/'),
  updateMe: (payload) => api.patch('/users/me/', payload),
};

export const walletAPI = {
  get: () => api.get('/payments/wallet/'),
  topup: (amount, method, phone) => api.post('/payments/wallet/topup/', { amount, method, phone }),
};

// Service recrutement/formation de chauffeurs (propriétaires + admin)
export const driversAPI = {
  serviceRequests: () => api.get('/drivers/service-requests/'),
  requestService: (payload) => api.post('/drivers/service-requests/', payload),
  updateServiceRequest: (id, payload) => api.patch(`/drivers/service-requests/${id}/`, payload),
};

// Messagerie interne — ?peer=<user_id> ou ?peer=support
export const messagesAPI = {
  list: (peer) => api.get('/users/messages/', { params: peer ? { peer } : {} }),
  threads: () => api.get('/users/messages/threads/'),
  contacts: () => api.get('/users/messages/contacts/'),
  send: (body, recipient) => api.post('/users/messages/', { body, recipient }),
  markRead: (peer) => api.post('/users/messages/read/', {}, { params: { peer } }),
};

// Tickets de maintenance/réparation véhicules (propriétaires + admin)
export const maintenanceAPI = {
  list: () => api.get('/vehicles/maintenance/'),
  create: (payload) => api.post('/vehicles/maintenance/', payload),
  update: (id, payload) => api.patch(`/vehicles/maintenance/${id}/`, payload),
};

// Paramètres plateforme (admin) + config publique
export const settingsAPI = {
  get: () => api.get('/users/settings/'),
  update: (payload) => api.patch('/users/settings/', payload),
  publicConfig: () => api.get('/users/public-config/'),
};

export default api;
