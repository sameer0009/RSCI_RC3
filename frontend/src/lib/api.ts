import axios from 'axios';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/$/, '');
export const api = axios.create({ baseURL: `${API_URL}/api`, withCredentials: true, timeout: 30000, headers: { 'Content-Type': 'application/json' } });
let refresh: Promise<unknown> | null = null;
api.interceptors.response.use(response => response, async error => {
  const original = error.config;
  if (original && error.response?.status === 401 && !original._retry && !/\/auth\/(login|refresh|logout)/.test(original.url || '')) {
    original._retry = true;
    try {
      // One refresh per browser tab prevents concurrent rotation from invalidating a session.
      if (!refresh) refresh = axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true, timeout: 10000 }).finally(() => { refresh = null; });
      await refresh;
      return api(original);
    } catch (refreshError) {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:expired'));
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
});
export default api;
