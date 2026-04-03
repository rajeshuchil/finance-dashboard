import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getSummary = () => api.get('/dashboard/summary');
export const getTotals = () => api.get('/dashboard/totals');
export const getCategories = () => api.get('/dashboard/categories');
export const getRecords = (params = {}) => api.get('/records', { params });
export const createRecord = (data) => api.post('/records', data);
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

export default api;
