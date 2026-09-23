import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      setToken(response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle network errors or storage access errors gracefully
    if (!error.response) {
      console.warn('Network error or request blocked:', error.message);
      return Promise.reject(error);
    }
    
    // Don't redirect on 401 for public pages/endpoints
    const publicPaths = ['/', '/services', '/login', '/register', '/privacy-policy', '/terms-of-service', '/refund-policy', '/contact'];
    const isPublicPage = publicPaths.some(path => 
      window.location.pathname === path || window.location.pathname.startsWith('/services/')
    );
    const isPublicEndpoint = error.config?.url?.includes('/auth/me') || 
                             error.config?.url?.includes('/services');
    
    if (error.response?.status === 401 && !isPublicEndpoint && !isPublicPage) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
};

// Services API
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getCategories: () => api.get('/services/categories'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  bulkDelete: (ids) => api.post('/services/bulk-delete', { ids }),
  checkSortOrder: (params) => api.get('/services/check-sort-order', { params }),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getMyStats: () => api.get('/orders/my-stats'),
  getAllAdmin: (params) => api.get('/orders/admin/all', { params }),
  getStats: () => api.get('/orders/admin/stats'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Wallet API
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getHistory: (params) => api.get('/wallet/history', { params }),
  createFundRequest: (data) => api.post('/wallet/fund-request', data),
  getMyFundRequests: (params) => api.get('/wallet/my-fund-requests', { params }),
  getFundRequests: (params) => api.get('/wallet/fund-requests', { params }),
  approveFundRequest: (id, data) => api.put(`/wallet/fund-requests/${id}/approve`, data),
  rejectFundRequest: (id, data) => api.put(`/wallet/fund-requests/${id}/reject`, data),
  adminAddFunds: (data) => api.post('/wallet/admin/add-funds', data),
  getAllTransactions: (params) => api.get('/wallet/admin/transactions', { params }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  syncServices: (providerId) => api.post('/admin/sync-services', { providerId }),
  getFinancialOverview: (period) => api.get('/admin/analytics/overview', { params: { period } }),
  getDailyBreakdown: (period) => api.get('/admin/analytics/daily', { params: { period } }),
  getCategoryBreakdown: (period) => api.get('/admin/analytics/categories', { params: { period } }),
  getServiceBreakdown: (period, limit) => api.get('/admin/analytics/services', { params: { period, limit } }),
  getProviderSpending: (period) => api.get('/admin/analytics/providers', { params: { period } }),
  getGrowthComparison: (period) => api.get('/admin/analytics/growth', { params: { period } }),
  getHourlyAndWeekday: (period) => api.get('/admin/analytics/hourly', { params: { period } }),
  getTopUsers: (period, limit) => api.get('/admin/analytics/top-users', { params: { period, limit } }),
};

// Messages API
export const messagesAPI = {
  getMyMessages: (params) => api.get('/messages/my', { params }),
  getUnreadCount: () => api.get('/messages/unread-count'),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  markAllAsRead: () => api.put('/messages/read-all'),
  getAllMessages: (params) => api.get('/messages/admin/all', { params }),
  sendMessage: (data) => api.post('/messages/admin/send', data),
  broadcastMessage: (data) => api.post('/messages/admin/broadcast', data),
  updateMessage: (id, data) => api.put(`/messages/admin/${id}`, data),
  deleteMessage: (id) => api.delete(`/messages/admin/${id}`),
};

// Payment Method API
export const paymentMethodAPI = {
  getAll: () => api.get('/payment-methods'),
  create: (data) => api.post('/payment-methods', data),
  update: (id, data) => api.put(`/payment-methods/${id}`, data),
  delete: (id) => api.delete(`/payment-methods/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  getAllAdmin: () => api.get('/reviews/admin/all'),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Provider API
export const providerAPI = {
  getAll: () => api.get('/providers'),
  getActive: () => api.get('/providers/active'),
  create: (data) => api.post('/providers', data),
  update: (id, data) => api.put(`/providers/${id}`, data),
  delete: (id) => api.delete(`/providers/${id}`),
  syncEnv: () => api.post('/providers/sync-env'),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  reorder: (order) => api.put('/categories/reorder', { order }),
  syncFromServices: () => api.post('/categories/sync-from-services'),
};

// Site Settings API
export const siteSettingsAPI = {
  get: () => api.get('/site-settings'),
  update: (data) => api.put('/site-settings', data),
};

export default api;
