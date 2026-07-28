import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://krushisathi-backend.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Request interceptor - attach admin token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const adminLogin = (email, password) =>
  api.post('/api/admin/login', { email: email.trim(), password: password.trim() });

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/api/admin/dashboard');

// ─── USERS ────────────────────────────────────────────────────────────────────
export const getUsers = (params) => api.get('/api/admin/users', { params });
export const updateUserRole = (id, role) => api.put(`/api/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/api/admin/users/${id}`);

// ─── SCANS ────────────────────────────────────────────────────────────────────
export const getScans = (params) => api.get('/api/admin/scans', { params });
export const deleteScan = (id) => api.delete(`/api/admin/scans/${id}`);

// ─── ALERTS ───────────────────────────────────────────────────────────────────
export const getAlerts = (params) => api.get('/api/admin/alerts', { params });
export const createAlert = (data) => api.post('/api/admin/alerts', data);
export const deleteAlert = (id) => api.delete(`/api/admin/alerts/${id}`);

// ─── EXPERT QUESTIONS ─────────────────────────────────────────────────────────
export const getExpertQuestions = (params) => api.get('/api/admin/expert-questions', { params });
export const answerQuestion = (id, data) => api.put(`/api/admin/expert-questions/${id}/answer`, data);
export const deleteExpertQuestion = (id) => api.delete(`/api/admin/expert-questions/${id}`);

// ─── DISEASES ─────────────────────────────────────────────────────────────────
export const getDiseases = (params) => api.get('/api/diseases', { params });
export const createDisease = (data) => api.post('/api/admin/diseases', data);
export const updateDisease = (id, data) => api.put(`/api/admin/diseases/${id}`, data);
export const deleteDisease = (id) => api.delete(`/api/admin/diseases/${id}`);

// ─── FERTILIZERS ──────────────────────────────────────────────────────────────
export const getFertilizers = () => api.get('/api/admin/fertilizers');
export const createFertilizer = (data) => api.post('/api/admin/fertilizers', data);
export const updateFertilizer = (id, data) => api.put(`/api/admin/fertilizers/${id}`, data);
export const deleteFertilizer = (id) => api.delete(`/api/admin/fertilizers/${id}`);

// ─── SHOP PRODUCTS ────────────────────────────────────────────────────────────
export const getShopProducts = () => api.get('/api/admin/shop-products');
export const deleteShopProduct = (id) => api.delete(`/api/admin/shop-products/${id}`);

export default api;
