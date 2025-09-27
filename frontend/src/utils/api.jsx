import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mini-app-ts9c.onrender.com/api';
  
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

export const kycAPI = {
  submitKYC: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/kyc/submit', formData, config);
  },
  getKYCStatus: () => api.get('/kyc/status'),
  getAllKYC: () => api.get('/kyc/all'),
  updateKYCStatus: (kycId, status) => api.put(`/kyc/${kycId}/status`, { status }),
};

export const productsAPI = {
  getAllProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  searchProducts: (query) => api.get(`/products/search?q=${query}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProductPrice: (id, price) => api.put(`/products/${id}/price`, { price }),
};

export const transactionsAPI = {
  buyProduct: (transactionData) => api.post('/transactions/buy', transactionData),
  getUserTransactions: () => api.get('/transactions/my'),
  getAllTransactions: () => api.get('/transactions/all'),
  getTransactionStats: () => api.get('/transactions/stats'),
};

export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  getPortfolioSummary: () => api.get('/portfolio/summary'),
  getWatchlist: () => api.get('/portfolio/watchlist'),
  addToWatchlist: (productId) => api.post(`/portfolio/watchlist/${productId}`),
  removeFromWatchlist: (productId) => api.delete(`/portfolio/watchlist/${productId}`),
};

export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders'),
  getOrderStats: () => api.get('/orders/stats'),
  cancelOrder: (orderId) => api.delete(`/orders/${orderId}`),
};

export const analyticsAPI = {
  getPortfolioAnalytics: () => api.get('/analytics/portfolio'),
  getMarketAnalytics: () => api.get('/analytics/market'),
  getUserTradingAnalytics: () => api.get('/analytics/trading'),
  getRiskAnalysis: () => api.get('/analytics/risk'),
};

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  getDashboardStats: () => api.get('/admin/dashboard'),
  updateUserWallet: (userId, amount) => api.put(`/admin/users/${userId}/wallet`, { amount }),
};

export default api;
