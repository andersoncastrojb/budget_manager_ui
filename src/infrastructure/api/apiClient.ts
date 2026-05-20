/**
 * Infrastructure Layer: HTTP Client Setup
 * Configures Axios with security interceptors, authentication handling,
 * and global error management.
 *
 * Security Features:
 * - Automatic JWT token attachment from HttpOnly cookies
 * - CSRF token handling
 * - 401/403 redirect to login
 * - Request/response transformation
 * - Error standardization
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse } from '@/domain/entities';

/**
 * API client configuration
 */
export class ApiClient {
  private static instance: AxiosInstance;
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  private static readonly CSRF_TOKEN_KEY = 'X-CSRF-Token';
  private static readonly AUTH_TOKEN_KEY = 'accessToken';

  /**
   * Initialize the API client with interceptors
   */
  public static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: this.API_BASE_URL,
        timeout: 30000,
        withCredentials: true, // Send cookies with requests (for HttpOnly cookies)
      });

      // Request interceptors
      this.instance.interceptors.request.use(
        (config) => this.attachAuthToken(config),
        (error) => Promise.reject(error)
      );

      // Response interceptors
      this.instance.interceptors.response.use(
        (response) => response,
        (error) => this.handleResponseError(error)
      );
    }

    return this.instance;
  }

  /**
   * Attach JWT token from HttpOnly cookie to request headers
   * The token should be set by the backend in HttpOnly, Secure, SameSite cookies
   * If token is also stored in memory for React Query invalidation, verify it's not in localStorage
   */
  private static attachAuthToken(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    // Token is automatically sent via withCredentials: true for HttpOnly cookies
    // No need to manually attach it to headers

    // Attach CSRF token if available
    const csrfToken = Cookies.get(this.CSRF_TOKEN_KEY);
    if (csrfToken && config.headers) {
      config.headers[this.CSRF_TOKEN_KEY] = csrfToken;
    }

    return config;
  }

  /**
   * Handle response errors globally
   * - 401: Redirect to login (session expired)
   * - 403: Insufficient permissions
   * - 4xx/5xx: Parse and standardize error
   */
  private static async handleResponseError(
    error: AxiosError
  ): Promise<never> {
    const status = error.response?.status;
    const responseData = error.response?.data as Record<string, unknown> | undefined;

    if (status === 401) {
      // Token expired or invalid - redirect to login
      this.clearAuthSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      // Insufficient permissions
      throw new ApiClientError(
        'FORBIDDEN',
        'You do not have permission to perform this action',
        (responseData?.error as Record<string, unknown>) || undefined
      );
    }

    // Parse backend error response
    const backendError = responseData?.error as Record<string, unknown> | undefined;
    const errorCode = (backendError?.code as string) || `ERROR_${status || 'UNKNOWN'}`;
    const errorMessage =
      (backendError?.message as string) || this.getDefaultErrorMessage(status);

    throw new ApiClientError(
      errorCode,
      errorMessage, // Generic message shown to user
      backendError?.details as Record<string, unknown> | undefined
    );
  }

  /**
   * Get generic error message for HTTP status codes
   * Never expose backend stack traces or sensitive details to users
   */
  private static getDefaultErrorMessage(status?: number): string {
    const messageMap: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Your session has expired. Please login again.',
      403: 'You do not have permission to access this resource.',
      404: 'The requested resource was not found.',
      409: 'The operation could not be completed. Please try again.',
      429: 'Too many requests. Please try again later.',
      500: 'An unexpected error occurred. Please try again later.',
      503: 'The service is temporarily unavailable. Please try again later.',
    };

    return messageMap[status || 500] || 'An error occurred. Please try again.';
  }

  /**
   * Clear authentication session
   */
  private static clearAuthSession(): void {
    // Remove CSRF token from cookies (HttpOnly auth token is removed by backend)
    Cookies.remove(this.CSRF_TOKEN_KEY);
    // Clear any in-memory token references (optional, based on your implementation)
  }
}

/**
 * Custom error class for API errors
 * Provides consistent error structure throughout the application
 */
export class ApiClientError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

/**
 * API request utilities
 */
export const apiClient = {
  /**
   * GET request
   */
  get: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return ApiClient.getInstance().get<ApiResponse<T>>(url, config);
  },

  /**
   * POST request
   */
  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return ApiClient.getInstance().post<ApiResponse<T>>(url, data, config);
  },

  /**
   * PUT request
   */
  put: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return ApiClient.getInstance().put<ApiResponse<T>>(url, data, config);
  },

  /**
   * DELETE request
   */
  delete: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return ApiClient.getInstance().delete<ApiResponse<T>>(url, config);
  },
};

export default ApiClient;
