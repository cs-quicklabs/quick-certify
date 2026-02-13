/**
 * Application Routes
 *
 * Centralized route definitions for consistent navigation.
 * Use these constants instead of hardcoded strings throughout the app.
 */

export const ROUTES = {
  // Authentication routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/signup',
    SIGNUP_COMPLETE: '/signup/complete',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    INVITATION: '/invitation',
    GOOGLE_CALLBACK: '/auth/google/callback',
    GOOGLE_LOGIN: '/auth/google/login',
    ERROR: '/auth/error',
  },

  // Dashboard routes
  DASHBOARD: {
    HOME: '/dashboard',
    SETTINGS: '/settings',
    PROFILE: '/settings/profile',
  },

  // Settings routes
  SETTINGS: {
    PROFILE: {
      ROOT: '/settings/profile',
      GENERAL: '/settings/profile/general',
      PASSWORD: '/settings/profile/password',
      EMAIL_PREFERENCES: '/settings/profile/email-preferences',
    },
    ACCOUNT: {
      ROOT: '/settings/account',
      GENERAL: '/settings/account/general-information',
      SOCIAL_LINKS: '/settings/account/social-links',
      BRANDING: '/settings/account/branding',
      PORTAL: '/settings/account/portal',
    },
    EVENT: {
      ROOT: '/settings/event',
      TYPE: '/settings/event/type',
      LEVEL: '/settings/event/level',
      FORMAT: '/settings/event/format',
    },
    TEAM: '/settings/team',
  },

  // Admin routes (system_admin only)
  ADMIN: {
    ORGANIZATIONS: '/admin/organizations',
  },

  // Feature routes
  EVENTS: '/events',
  CREDENTIALS: '/credentials',
  CREDENTIALS_ISSUE: '/credentials/issue',
  DESIGNS: '/designs',
  EMAILS: '/emails',
  ANALYTICS: '/analytics',
  INTEGRATIONS: '/integrations',

  // Public routes
  PUBLIC: {
    HOME: '/',
  },
} as const;

/**
 * Type-safe route helper
 * Use this for dynamic routes with parameters
 */
export const createRoute = {
  eventDetail: (id: string) => `/events/${id}` as const,
  credentialDetail: (id: string) => `/credentials/${id}` as const,
  teamMember: (id: string) => `/settings/team/${id}` as const,
  resetPasswordWithToken: (token: string) => `/reset-password?token=${token}` as const,
  invitationWithToken: (token: string) => `/invitation?token=${token}` as const,
} as const;
