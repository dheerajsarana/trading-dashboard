import { apiClient } from './client';
import { API_CONFIG } from '../config/api.config';
import { User } from '../services/auth.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(API_CONFIG.endpoints.auth.register, data, {
      skipAuth: true,
    });
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(API_CONFIG.endpoints.auth.login, credentials, {
      skipAuth: true,
    });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(API_CONFIG.endpoints.auth.logout);
  },

  /**
   * Get current user
   */
  getMe: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>(API_CONFIG.endpoints.auth.me);
  },
};
