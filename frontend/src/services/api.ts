import axios from 'axios';

// Get base URL from environment or default to backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

function isTokenValid(token: string | null): boolean {
  if (!token || token.includes('mock_')) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return true;
    // Valid if expiration is more than 30 seconds in the future
    return Date.now() < (payload.exp * 1000 - 30000);
  } catch {
    return false;
  }
}

// Request interceptor to attach JWT auth token
// Shared in-flight promise for auto-authenticating demo session
let authPromise: Promise<string | null> | null = null;

export async function getOrFetchToken(forceRefresh = false): Promise<string | null> {
  const existing = localStorage.getItem('cybertrace_jwt_token');
  if (!forceRefresh && isTokenValid(existing)) {
    return existing;
  }

  // Clear stale or expired token
  localStorage.removeItem('cybertrace_jwt_token');

  if (!authPromise) {
    authPromise = axios
      .post(`${API_BASE_URL}/auth/login`, {
        email: 'officer@cybertrace.gov.in',
        password: 'password123'
      }, { timeout: 5000 })
      .then((res) => {
        if (res.data?.token) {
          const tok = String(res.data.token);
          localStorage.setItem('cybertrace_jwt_token', tok);
          localStorage.setItem('cybertrace_user', JSON.stringify({
            id: res.data.userId || 'b0000000-0000-0000-0000-000000000002',
            name: res.data.name || 'Inspector Vikram Roy',
            email: res.data.email || 'officer@cybertrace.gov.in',
            role: res.data.role || 'ROLE_I4C_OFFICER',
            department: 'I4C Rapid Response',
            state: 'Delhi',
            district: 'Central Delhi',
            isActive: true
          }));
          return tok;
        }
        return null;
      })
      .catch((err) => {
        console.warn('Auto-login failed to fetch fresh token:', err);
        return null;
      })
      .finally(() => {
        authPromise = null;
      });
  }
  return authPromise;
}

// Request interceptor to attach JWT auth token
apiClient.interceptors.request.use(
  async (config) => {
    if (!config.url?.includes('/auth/')) {
      const token = await getOrFetchToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthenticated states with automatic token recovery & retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      console.warn('401 Unauthorized encountered. Fetching fresh JWT and retrying request...');
      const freshToken = await getOrFetchToken(true);
      if (freshToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

