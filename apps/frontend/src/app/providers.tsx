'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCrossTabLogout } from '@/hooks/useCrossTabLogout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createQueryClient } from '@/lib/query-client';

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
 * Wraps the app with necessary providers including React Query with global error handling.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create query client once per app lifecycle
  // Using useState with a factory function ensures it's only created once
  const [queryClient] = useState(() => createQueryClient());

  const content = (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </QueryClientProvider>
  );

  return <ErrorBoundary>{content}</ErrorBoundary>;
}
