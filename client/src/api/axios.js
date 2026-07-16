import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ── Attach API base to image/upload URLs returned from the server ──
export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const base = API_URL || '';
  return `${base}${path}`;
}

// ── Admin: attach JWT to every request ─────────────────────────────
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Admin: 401 → redirect to login ─────────────────────────────────
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
