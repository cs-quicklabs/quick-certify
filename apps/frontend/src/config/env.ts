/**
 * Environment Configuration
 *
 * Centralized environment variables with type safety
 */

export const env = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',

  // App Configuration
  APP_NAME: 'Quick Certify',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

export type Env = typeof env;
