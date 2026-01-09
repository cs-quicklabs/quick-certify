'use client';

import { useCallback, useState } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { env } from '@/config';

interface GoogleSignInButtonProps {
  onSuccess?: (credential: string) => void | Promise<void>;
  onError?: (error: Error) => void;
  mode?: 'login' | 'signup';
  className?: string;
  disabled?: boolean;
}

/**
 * Google Icon SVG
 */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/**
 * Google Sign-In Button
 *
 * Uses backend redirect flow for Google OAuth.
 * Styled to match the Flowbite design system.
 */
export function GoogleSignInButton({
  mode = 'login',
  className,
  disabled,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle Google sign-in using backend redirect flow
   */
  const handleGoogleSignIn = useCallback(() => {
    setIsLoading(true);

    // Build the redirect URL - this is where backend will redirect after Google auth
    const action = mode === 'signup' ? 'signup' : 'login';
    const frontendUrl = typeof window !== 'undefined' ? window.location.origin : env.APP_URL;
    const callbackUrl = `${frontendUrl}/auth/callback`;

    // Redirect to backend Google OAuth endpoint
    // Backend will redirect to Google, then Google redirects back to backend callback,
    // and finally backend redirects to our frontend callback with tokens
    const googleAuthUrl = `${env.API_BASE_URL}/auth/google/redirect?action=${action}&redirectUrl=${encodeURIComponent(callbackUrl)}`;

    window.location.href = googleAuthUrl;
  }, [mode]);

  const buttonText = mode === 'login' ? 'Sign in with Google' : 'Sign up with Google';

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      className={clsx(
        'w-full inline-flex items-center justify-center gap-3',
        'px-5 py-2.5 text-sm font-medium',
        'text-gray-900 bg-white rounded-lg border border-gray-300',
        'hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-100',
        'dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700',
        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span>{buttonText}</span>
    </button>
  );
}
