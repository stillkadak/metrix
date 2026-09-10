import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh & 401 response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (email: string, password: string) =>
    api.post(
      '/auth/login',
      new URLSearchParams({ username: email, password }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    ),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const scans = {
  upload: (formData: FormData) =>
    api.post('/scans/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: (params?: { skip?: number; limit?: number; is_compliant?: boolean; severity?: string; search?: string }) =>
    api.get('/scans', { params }),
  get: (id: string) => api.get(`/scans/${id}`),
  getViolations: (id: string) => api.get(`/scans/${id}/violations`),
  getPdfUrl: (id: string) => `${API_BASE_URL}/scans/${id}/pdf`,
  downloadPdf: (id: string) =>
    api.get(`/scans/${id}/pdf`, { responseType: 'blob' }),
};

export const violations = {
  list: (params?: { skip?: number; limit?: number; severity?: string }) =>
    api.get('/violations', { params }),
};

export const products = {
  list: (params?: { skip?: number; limit?: number; search?: string }) =>
    api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
};

export const reports = {
  summary: (days: number = 30) => api.get('/reports/summary', { params: { days } }),
  getPdfUrl: (id: string) => `${API_BASE_URL}/reports/${id}/pdf`,
};

export const analytics = {
  summary: () => api.get('/analytics/summary'),
  violations: (days: number = 30) => api.get('/analytics/violations', { params: { days } }),
};
