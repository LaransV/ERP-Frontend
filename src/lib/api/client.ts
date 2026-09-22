import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request interceptor ───────────────────────────────────────
// Attaches JWT token + X-Company-Id header so the backend knows
// which company's data to filter.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    try {
      // 1. Attach JWT
      const authRaw = localStorage.getItem('nexerp-auth');
      if (authRaw) {
        const token = JSON.parse(authRaw)?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Attach active company id so backend filters data for this company
      //    The active company is stored in nexerp-company (themeStore / companyStore).
      //    When the user switches company in TopBar, companyStore updates activeCompanyId,
      //    and every subsequent API call automatically picks it up here.
      const companyRaw = localStorage.getItem('nexerp-company');
      if (companyRaw) {
        const activeCompanyId = JSON.parse(companyRaw)?.state?.activeCompanyId;
        if (activeCompanyId) {
          config.headers['X-Company-Id'] = String(activeCompanyId);
        }
      }
    } catch { /* ignore parse errors */ }
  }
  return config;
});

// ─── Response interceptor ─────────────────────────────────────
// 401 → clear local storage and redirect to login
api.interceptors.response.use(
  r => r,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nexerp-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
