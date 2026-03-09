/**
 * API Client
 *
 * Centralized HTTP client using Axios with interceptors
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/config';

/**
 * API Response Types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errorCode?: number;
  errors?: Record<string, string>;
}

/**
 * Check if error is a network/CORS error
 */
function isNetworkError(error: AxiosError): boolean {
  return !error.response && error.code !== 'ECONNABORTED';
}

/**
 * Create API client instance
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
    withCredentials: true, // Include cookies for cross-origin requests
  });

  // Request interceptor - Add auth token
  client.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - Handle errors and token refresh
  // Session expiry is handled automatically here based on backend token expiry.
  // When access token expires (401), it automatically refreshes using the refresh token.
  // User is only logged out when refresh token is expired/invalid.
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle network/CORS errors
      if (isNetworkError(error)) {
        console.log('Network error - possible CORS issue or server unavailable:', error.message);
        const networkError: ApiError = {
          success: false,
          message:
            'Unable to connect to the server. Please check your network connection or try again later.',
          statusCode: 0,
        };
        return Promise.reject({ response: { data: networkError } });
      }

      // Handle 401 - Automatically refresh access token
      // Only logout when refresh token is expired/invalid
      if (error.response?.status === 401) {
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');

        // Skip refresh for auth endpoints (login, register, refresh-token itself) to prevent loops
        // For these endpoints, return error as-is
        if (isAuthEndpoint) {
          return Promise.reject(error);
        }

        // Prevent infinite retry loops
        if (originalRequest._retry) {
          // Already tried to refresh, refresh token must be expired - logout
          forceLogout();
          return Promise.reject(error);
        }

        // Mark request as retried to prevent infinite loops
        originalRequest._retry = true;

        // Attempt to refresh the access token
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No refresh token available - logout
          forceLogout();
          return Promise.reject(error);
        }

        try {
          // Call refresh token endpoint
          const response = await axios.post<
            ApiResponse<{ accessToken: string; refreshToken: string }>
          >(`${env.API_BASE_URL}/auth/refresh-token`, { refreshToken }, { withCredentials: true });

          if (response.data.success && response.data.data) {
            // Store new tokens
            setTokens(response.data.data.accessToken, response.data.data.refreshToken);

            // Update original request with new access token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            }

            // Retry original request with new access token
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token is expired or invalid - logout user
          forceLogout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}

/**
 * Token management helpers
 */
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
export const SESSION_ID_KEY = 'authSessionId';
const AUTH_STORAGE_KEY = 'auth-storage';
const QUERY_CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  // Set session identifier to detect cross-tab logins
  localStorage.setItem(SESSION_ID_KEY, Date.now().toString());

  // Set cookie for middleware access
  // We use a safe defaultmax-age (e.g., 7 days) if we don't have the exact expiry
  // The backend will validate the token validity anyway
  document.cookie = `${TOKEN_KEY}=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_ID_KEY);

  // Clear cookie
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
}

function forceLogout(): void {
  clearTokens();
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(QUERY_CACHE_KEY);
  window.location.href = '/login';
}

export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_ID_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Export singleton API client
 */
export const apiClient = createApiClient();
