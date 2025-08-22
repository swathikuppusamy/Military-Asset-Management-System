import axios from 'axios';

//const API_BASE_URL = 'https://military-asset-management-system-9u0c.onrender.com/api/v1'||'http://localhost:5000/api/v1';
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/v1"
    : "https://military-asset-management-system-9u0c.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  verifyToken: () => api.get('/auth/verify'),
};

export const assetsAPI = {
  getAll: (filters) => api.get('/assets', { params: filters }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
};

export const transfersAPI = {
  getAll: (filters) => api.get('/transfers', { params: filters }),
  getById: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  update: (id, data) => api.put(`/transfers/${id}`, data),
  delete: (id) => api.delete(`/transfers/${id}`),
  approve: (id) => api.patch(`/transfers/${id}/approve`),
  reject: (id) => api.patch(`/transfers/${id}/reject`),
  cancel: (id) => api.patch(`/transfers/${id}/cancel`),
};

export const purchasesAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`)
};

export const assignmentsAPI = {
  getAll: (filters) => api.get('/assignments', { params: filters }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  return: (id) => api.patch(`/assignments/${id}/return`),
  expend: (id) => api.patch(`/assignments/${id}/expend`),
};

// Add to frontend/src/services/api.js
export const expendituresAPI = {
  getAll: (filters) => api.get('/expenditures', { params: filters }),
  getById: (id) => api.get(`/expenditures/${id}`),
  create: (data) => api.post('/expenditures', data),
  update: (id, data) => api.patch(`/expenditures/${id}`, data),
  delete: (id) => api.delete(`/expenditures/${id}`),
  approve: (id) => api.patch(`/expenditures/${id}/approve`),
  getStats: () => api.get('/expenditures/stats'),
};
// In services/api.js
export const dashboardAPI = {
  getMetrics: (filters) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters.base) params.append('base', filters.base);
    if (filters.assetType) params.append('assetType', filters.assetType);
    
    return api.get(`/dashboard/metrics?${params}`);
  },
  
  getChartsData: (filters) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters.base) params.append('base', filters.base);
    if (filters.assetType) params.append('assetType', filters.assetType);
    
    return api.get(`/dashboard/charts?${params}`);
  }
};

export const settingsAPI = {
  getGeneral: () => api.get('/settings/general'),
  updateGeneral: (data) => api.put('/settings/general', data),
  getSystem: () => api.get('/settings/system'),
  updateSystem: (data) => api.put('/settings/system', data),
  getAssetTypes: () => api.get('/settings/asset-types'),
  createAssetType: (data) => api.post('/settings/asset-types', data),
  updateAssetType: (id, data) => api.put(`/settings/asset-types/${id}`, data),
  deleteAssetType: (id) => api.delete(`/settings/asset-types/${id}`),
  getBases: () => api.get('/settings/bases'),
  createBase: (data) => api.post('/settings/bases', data),
  updateBase: (id, data) => api.put(`/settings/bases/${id}`, data),
  deleteBase: (id) => api.delete(`/settings/bases/${id}`),
  backupData: () => api.get('/settings/backup'),
  restoreData: (backupFile) => {
    const formData = new FormData();
    formData.append('backup', backupFile);
    return api.post('/settings/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  clearCache: () => api.post('/settings/clear-cache'),
  optimizeDatabase: () => api.post('/settings/optimize-db'),
  getLogs: (params = {}) => api.get('/settings/logs', { params }),
  clearLogs: () => api.delete('/settings/logs'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

export const basesAPI = {
  getAll: () => api.get('/bases'),
  getById: (id) => api.get(`/bases/${id}`),
  create: (data) => api.post('/bases', data),
  update: (id, data) => api.put(`/bases/${id}`, data),
  delete: (id) => api.delete(`/bases/${id}`),
};

export const assetTypesAPI = {
  getAll: () => api.get('/asset-types'),
  getById: (id) => api.get(`/asset-types/${id}`),
  create: (data) => api.post('/asset-types', data),
  update: (id, data) => api.put(`/asset-types/${id}`, data),
  delete: (id) => api.delete(`/asset-types/${id}`),
};

export default api;