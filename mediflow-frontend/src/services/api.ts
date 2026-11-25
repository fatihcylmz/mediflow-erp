// Centralized Axios instance for MediFlow API calls
import axios, { AxiosError } from 'axios';
import { message } from 'antd';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT token attach
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Debounce: son 3 saniye içinde aynı mesaj tekrar gösterilmez
let lastMessage = '';
let lastMessageTime = 0;
const showDebouncedMessage = (msg: string, type: 'error' | 'success' | 'warning' = 'error') => {
  const now = Date.now();
  if (msg === lastMessage && now - lastMessageTime < 3000) return;
  lastMessage = msg;
  lastMessageTime = now;
  message[type](msg, 4);
};

// Response interceptor - Global error handling for ABP UserFriendlyExceptions
api.interceptors.response.use(
  response => response,
  (error: AxiosError & { response?: { data?: { message?: string; title?: string; errors?: Record<string, string[]> } } }) => {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;
    const requestUrl = error.config?.url || '';

    // Don't redirect on 401 for token endpoint (login page)
    if (statusCode === 401 && !requestUrl.includes('/connect/token')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (statusCode === 403) {
      showDebouncedMessage(responseData?.title || 'Bu işlem için yetkiniz bulunmuyor.', 'error');
      return Promise.reject(error);
    }

    if (responseData?.message) {
      const msg = typeof responseData.message === 'string'
        ? responseData.message
        : (typeof responseData.title === 'string' ? responseData.title : null);

      if (msg && !msg.includes('An unexpected error')) {
        showDebouncedMessage(msg, 'error');
        return Promise.reject(error);
      }
    }

    if (responseData?.errors) {
      Object.values(responseData.errors).flat().forEach(err => {
        showDebouncedMessage(err, 'error');
      });
      return Promise.reject(error);
    }

    showDebouncedMessage(`İşlem başarısız oldu. Lütfen tekrar deneyin. (${statusCode})`, 'error');
    return Promise.reject(error);
  }
);

export default api;
