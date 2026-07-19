import axios from 'axios';

/** Full REST API base (e.g. http://localhost:4000/api) */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Server origin WITHOUT the /api suffix.
 * Use this for socket connections & static asset URLs (uploads, avatars, etc.).
 */
export function getServerBaseUrl(): string {
  return API_URL.replace(/\/api\/?$/, '');
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
