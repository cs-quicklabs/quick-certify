/**
 * Auth Service
 *
 * Handles authentication API calls
 */

import { apiClient, ApiResponse, setTokens, clearTokens } from './api-client';

/**
 * Auth Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  websiteUrl: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface GoogleSignupCompleteRequest {
  idToken?: string;
  tempToken?: string;
  companyName: string;
  websiteUrl: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
  roleId: string;
  role: string;
  sessionHash?: string;
}

export interface GoogleOAuthStatus {
  configured: boolean;
}

export interface GoogleAuthUrl {
  url: string;
  state: string;
}

/**
 * Auth Service Methods
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data);
    if (response.data.success) {
      setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data.data;
  },

  /**
   * Register new user with organization
   */
  async register(data: RegisterRequest): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/register', data);
    if (response.data.success) {
      setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data.data;
  },

  /**
   * Google OAuth login
   */
  async googleLogin(data: GoogleLoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/google/login', data);
    if (response.data.success) {
      setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data.data;
  },

  /**
   * Complete Google signup with organization details
   */
  async completeGoogleSignup(data: GoogleSignupCompleteRequest): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/google/signup/complete', data);
    if (response.data.success) {
      setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data.data;
  },

  /**
   * Check Google OAuth status
   */
  async getGoogleOAuthStatus(): Promise<GoogleOAuthStatus> {
    const response = await apiClient.get<ApiResponse<GoogleOAuthStatus>>('/auth/google/status');
    return response.data.data;
  },

  /**
   * Get Google auth URL for redirect flow
   */
  async getGoogleAuthUrl(action: 'login' | 'signup', redirectUrl?: string): Promise<GoogleAuthUrl> {
    const response = await apiClient.post<ApiResponse<GoogleAuthUrl>>('/auth/google/init', {
      action,
      redirectUrl,
    });
    return response.data.data;
  },

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      '/auth/forgot-password',
      data,
    );
    return response.data.data;
  },

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      '/auth/reset-password',
      data,
    );
    return response.data.data;
  },

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  /**
   * Logout all sessions
   */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post('/auth/logout-all');
    } finally {
      clearTokens();
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};

