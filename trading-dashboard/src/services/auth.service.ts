import { storageService, STORAGE_KEYS } from './storage.service';

export interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus?: 'free' | 'pro';
  createdAt?: string;
}

/**
 * Authentication service for token and user management
 */
class AuthService {
  /**
   * Save authentication token to localStorage
   */
  saveToken(token: string): void {
    storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Get authentication token from localStorage
   */
  getToken(): string | null {
    return storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Remove authentication token from localStorage
   */
  removeToken(): void {
    storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Save user data to localStorage
   */
  saveUser(user: User): void {
    storageService.setItem(STORAGE_KEYS.USER, user);
  }

  /**
   * Get user data from localStorage
   */
  getUser(): User | null {
    return storageService.getItem<User>(STORAGE_KEYS.USER);
  }

  /**
   * Remove user data from localStorage
   */
  removeUser(): void {
    storageService.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode JWT token to check expiration
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Decode JWT token
   */
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  }
}

export const authService = new AuthService();
