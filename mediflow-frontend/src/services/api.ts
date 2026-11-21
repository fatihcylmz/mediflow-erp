// Centralized Axios instance for MediFlow API calls
// Includes an interceptor that adds the JWT bearer token (if present) to each request.
import axios from 'axios';

// Vite proxy (vite.config.ts) forwards /api/app/* → http://localhost:5000
// so the browser never needs to know the backend address.
const baseURL =
  (import.meta as any).env?.VITE_API_URL || '/api/app';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Separate instance for ABP account endpoints (login/logout) at /api/account/*
const accountApi = axios.create({
  baseURL: '/api/account',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach Authorization header when token is stored
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore – Axios typings allow arbitrary header keys
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export { accountApi };
export default api;