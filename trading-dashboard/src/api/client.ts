import { API_CONFIG } from '../config/api.config';
import { authService } from '../services/auth.service';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean;
}

/**
 * API Client for making HTTP requests with authentication
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Get default headers with authentication
   */
  private getHeaders(skipAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (!skipAuth) {
      const token = authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Parse response first
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // If we're not on the login page, redirect
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        authService.clearAuth();
        window.location.href = '/login';
      }
      // Throw the actual error message from backend
      const errorMessage = data?.message || data?.error || 'Invalid credentials';
      throw new Error(errorMessage);
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const errorCode = data?.code;
      if (errorCode === 'SUBSCRIPTION_REQUIRED') {
        throw new Error('Pro subscription required');
      }
      throw new Error('Access denied');
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  /**
   * Make HTTP request with timeout
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, skipAuth = false, ...fetchOptions } = options;

    const url = this.buildURL(endpoint, params);
    const headers = this.getHeaders(skipAuth);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
        credentials: 'include', // Include cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async uploadFile<T>(endpoint: string, file: File, options?: RequestOptions): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options || {};

    const url = this.buildURL(endpoint);
    const formData = new FormData();
    formData.append('file', file);

    // Headers for file upload (don't set Content-Type, browser will set it with boundary)
    const headers: HeadersInit = {};
    if (!skipAuth) {
      const token = authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Upload timeout');
      }

      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
