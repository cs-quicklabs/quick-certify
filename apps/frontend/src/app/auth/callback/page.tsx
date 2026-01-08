'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo, Alert, Button } from '@/components';
import { setTokens } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services';

/**
 * Auth Callback Page
 *
 * Handles OAuth callback from backend after Google authentication.
 * Processes tokens or redirects to signup completion.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for error in URL
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setIsProcessing(false);
          return;
        }

        // Check for tokens (successful login)
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
          // Store tokens
          setTokens(accessToken, refreshToken);

          // Fetch current user
          const user = await authService.getCurrentUser();
          setUser(user);

          // Redirect to dashboard
          router.replace('/dashboard');
          return;
        }

        // Check for temp token (needs to complete signup)
        const tempToken = searchParams.get('tempToken');
        if (tempToken) {
          // Redirect to complete signup with temp token
          router.replace(`/signup/complete?tempToken=${encodeURIComponent(tempToken)}`);
          return;
        }

        // No valid parameters found
        setError('Invalid authentication callback. Please try again.');
        setIsProcessing(false);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Failed to process authentication. Please try again.');
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router, setUser]);

  // Show loading state
  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Logo size="lg" asLink={false} />
        <div className="mt-8 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Processing authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Logo size="lg" asLink={false} />
        <div className="mt-8 w-full max-w-md">
          <Alert type="error" title="Authentication Failed" message={error} className="mb-6" />
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push('/login')}>
              Back to Login
            </Button>
            <Button onClick={() => router.push('/signup')}>Sign Up</Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

