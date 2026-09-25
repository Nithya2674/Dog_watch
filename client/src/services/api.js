import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ status, message });
  }
);

export const authAPI = {
  sendOTP: (phoneNumber) => api.post('/auth/send-otp', { phoneNumber }),
  verifyOTP: (phoneNumber, otp) => api.post('/auth/verify-otp', { phoneNumber, otp }),
  getMe: () => api.get('/auth/me'),
};

export const reportAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  getMy: () => api.get('/reports/my'),
  getStats: () => api.get('/reports/stats'),
  getNearby: (lat, lng, radius = 5000) =>
    api.get('/reports/nearby', { params: { lat, lng, radius } }),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

export default api;
