export const ROUTES = {
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/signup',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
        VERIFY_EMAIL: '/verify-email',
        INVITATION: '/invitation',
        GOOGLE_CALLBACK: '/auth/google/callback',
        GOOGLE_LOGIN: '/auth/google/login',
    },
    DASHBOARD: {
        HOME: '/dashboard',
        SETTINGS: '/settings',
        PROFILE: '/settings/profile',
    },
    PUBLIC: {
        HOME: '/',
    },
} as const;
