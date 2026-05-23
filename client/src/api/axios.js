import axios from 'axios';
import { clearAuthStorage, getStoredAuthToken } from '../utils/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = config.headers.Authorization || `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthStorage();

      if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
        window.location.replace('/auth');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
