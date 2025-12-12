import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://blogging-site-college-project.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getUser: () => api.get('/api/auth/user'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.put('/api/auth/password', data),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  verifyResetToken: (token) => api.get(`/api/auth/verify-reset-token/${token}`),
  googleAuthUrl: () => `${API_URL}/api/auth/google`,
};

// Blog API
export const blogAPI = {
  getAll: (params) => api.get('/api/blogs', { params }),
  getRecent: (limit = 5) => api.get('/api/blogs/recent', { params: { limit } }),
  getOne: (id) => api.get(`/api/blogs/${id}`),
  create: (data) => api.post('/api/blogs', data),
  update: (id, data) => api.put(`/api/blogs/${id}`, data),
  delete: (id) => api.delete(`/api/blogs/${id}`),
  getUserBlogs: (userId, params) => api.get(`/api/blogs/user/${userId}`, { params }),
  getMyBlogs: (params) => api.get('/api/blogs/my/posts', { params }),
};

// AI API
export const aiAPI = {
  generateTags: (content, maxTags = 5) => api.post('/api/ai/tags', { content, maxTags }),
  generateSummary: (content, length = 'medium') => api.post('/api/ai/summary', { content, length }),
  generateTitles: (content, count = 5) => api.post('/api/ai/titles', { content, count }),
  expandText: (text, tone = 'casual') => api.post('/api/ai/expand', { text, tone }),
  improveText: (text) => api.post('/api/ai/improve', { text }),
  changeTone: (text, targetTone) => api.post('/api/ai/tone', { text, targetTone }),
  continueWriting: (text, sentences = 3) => api.post('/api/ai/continue', { text, sentences }),
  checkGrammar: (text) => api.post('/api/ai/grammar', { text }),
  classifyCategory: (content) => api.post('/api/ai/category', { content }),
  fullAnalysis: (content) => api.post('/api/ai/analyze', { content }),
  getStatus: () => api.get('/api/ai/status'),
};

export default api;
