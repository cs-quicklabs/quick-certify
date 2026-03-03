'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert, Logo } from '@/components';
import { useAuthStore } from '@/store/auth.store';
import { authService, setTokens } from '@/services';
import { getApiErrorMessage } from '@/lib/api-error';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Processing authentication...');

  const handleCallback = useCallback(async () => {
    // Check for error
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
      return;
    }

    // Check for tokens (successful login)
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      try {
        setStatus('Logging you in...');

        // Set tokens in localStorage
        setTokens(accessToken, refreshToken);

        // Fetch user info
        const user = await authService.getCurrentUser();
        setUser(user);

        // Redirect to dashboard
        router.push('/dashboard');
        return;
      } catch (err) {
        console.error('Failed to fetch user: ', err);
        setError(
          getApiErrorMessage(
            err,
            'Authentication successful but failed to load user data. Please try logging in again.',
          ),
        );
        return;
      }
    }

    // Check for temp token (new user needs to complete signup)
    const tempToken = searchParams.get('tempToken');
    if (tempToken) {
      setStatus('Redirecting to complete signup...');
      router.push(`/signup/complete?tempToken=${encodeURIComponent(tempToken)}`);
      return;
    }

    // No valid parameters
    setError('Invalid authentication response. Please try again.');
  }, [searchParams, router, setUser]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8">
        <Logo size="lg" asLink={false} />
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        {error ? (
          <div className="text-center">
            <Alert type="error" message={error} className="mb-6" />
            <button
              onClick={() => router.push('/login')}
              className="text-primary-600 hover:underline font-medium"
            >
              Return to login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
            <p className="text-gray-600">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthCallbackSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8">
        <Logo size="lg" asLink={false} />
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackSkeleton />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
