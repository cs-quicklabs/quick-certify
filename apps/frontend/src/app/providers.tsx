'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCrossTabLogout } from '@/hooks/useCrossTabLogout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// import { env } from '@/config';

/**
 * Auth Initializer
 * Initializes auth state on app load and handles cross-tab logout.
 * Session expiry is handled automatically by the API client interceptor
 * based on backend token expiry.
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized } = useAuthStore();

  // Handle cross-tab logout - when user logs in from another tab, logout current tab
  useCrossTabLogout();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return <>{children}</>;
}

/**
 * App Providers
 * Wraps the app with necessary providers
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const content = (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  return <ErrorBoundary>{content}</ErrorBoundary>;
}
