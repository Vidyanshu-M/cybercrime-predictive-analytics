import { apiClient } from './api';
import { User, UserRole } from '../types';
import { MOCK_USERS } from './mockData';

export interface LoginRequest {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export const authService = {
  // Check if mock mode is active
  isMockMode(): boolean {
    const mode = localStorage.getItem('cybertrace_use_mock');
    return mode === null || mode === 'true';
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (this.isMockMode()) {
      // Simulate API network delay
      await new Promise((res) => setTimeout(res, 600));
      
      const foundUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase() || u.role === credentials.role
      ) || MOCK_USERS[0];

      const mockResponse: LoginResponse = {
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_jwt_token_${foundUser.id}`,
        user: foundUser,
        expiresIn: 86400,
      };

      localStorage.setItem('cybertrace_jwt_token', mockResponse.token);
      localStorage.setItem('cybertrace_user', JSON.stringify(mockResponse.user));
      return mockResponse;
    }

    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('cybertrace_jwt_token', response.data.token);
      localStorage.setItem('cybertrace_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getCurrentUser(): User | null {
    const cached = localStorage.getItem('cybertrace_user');
    if (!cached) return MOCK_USERS[0]; // Default fallback for demo
    try {
      return JSON.parse(cached);
    } catch {
      return MOCK_USERS[0];
    }
  },

  logout(): void {
    localStorage.removeItem('cybertrace_jwt_token');
    localStorage.removeItem('cybertrace_user');
  }
};
