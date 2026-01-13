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
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle network/CORS errors
      if (isNetworkError(error)) {
        console.error('Network error - possible CORS issue or server unavailable:', error.message);
        const networkError: ApiError = {
          success: false,
          message: 'Unable to connect to the server. Please check your network connection or try again later.',
          statusCode: 0,
        };
        return Promise.reject({ response: { data: networkError } });
      }

      // Handle 401 - Check for "Access token is required" error
      if (error.response?.status === 401) {
        const errorData = error.response.data;
        const isAccessTokenRequiredError =
          errorData?.message === 'Access token is required' || errorData?.errorCode === 401;

        if (isAccessTokenRequiredError) {
          // Clear tokens and storage immediately - don't attempt refresh
          clearTokens();
          if (typeof window !== 'undefined') {
            // Clear auth store (Zustand persist storage)
            localStorage.removeItem('auth-storage');
            // Clear React Query cache
            localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
            // Redirect to login
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // For other 401 errors, attempt token refresh
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
              const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
                `${env.API_BASE_URL}/auth/refresh-token`,
                { refreshToken },
                { withCredentials: true },
              );

              if (response.data.success) {
                setTokens(response.data.data.accessToken, response.data.data.refreshToken);
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
                }
                return client(originalRequest);
              }
            }
          } catch {
            // Refresh failed - clear tokens and redirect to login
            clearTokens();
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-storage');
              localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
              window.location.href = '/login';
            }
          }
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
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_ID_KEY);
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

