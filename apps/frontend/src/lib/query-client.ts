/**
 * Query Client Configuration
 *
 * Centralized React Query client with global error handling.
 * All mutations automatically show toast notifications on error.
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getApiErrorMessage, getApiFieldErrors } from './api-error';
import { AxiosError } from 'axios';

/**
 * Global error handler for all queries
 */
function handleQueryError(error: unknown) {
  // Log query errors for debugging
  console.log('[React Query] Query error:', error);
}

/**
 * Global error handler for all mutations
 * Shows toast notification with user-friendly error message
 */
function handleMutationError(error: unknown) {
  // Get user-friendly error message
  const message = getApiErrorMessage(error, 'An unexpected error occurred');

  // Get field errors if available (for form validation)
  const fieldErrors = getApiFieldErrors(error);

  // Log error for debugging
  console.log('[React Query] Mutation error:', {
    message,
    fieldErrors,
    originalError: error,
  });

  // Show toast notification
  toast.error(message, {
    toastId: 'mutation-error', // Prevent duplicate toasts
    autoClose: 5000,
  });
}

/**
 * Determine if an error should be silently ignored
 * (e.g., 401 errors are handled by the API client interceptor)
 */
function shouldSilenceError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    // 401 errors are handled by the API client (redirects to login)
    if (error.response?.status === 401) {
      return true;
    }
  }
  return false;
}

/**
 * Create a configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Skip silent errors
        if (shouldSilenceError(error)) {
          return;
        }

        // Log query errors
        handleQueryError(error);

        // Optionally show toast for critical query errors
        // Only show for important data fetches, not background refetches
        if (query.state.fetchFailureCount === 1 && !query.state.data) {
          const message = getApiErrorMessage(error, 'Failed to load data');
          toast.error(message, {
            toastId: `query-error-${query.queryKey.join('-')}`,
            autoClose: 5000,
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Skip silent errors
        if (shouldSilenceError(error)) {
          return;
        }

        // Skip if mutation has custom error handling
        // (Check if onError was defined in the mutation options)
        const options = mutation.options;
        if (options.onError && options.onError !== handleMutationError) {
          // Custom onError is defined, let it handle the error
          return;
        }

        // Show global toast notification
        handleMutationError(error);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof AxiosError) {
            const status = error.response?.status;
            if (status && status >= 400 && status < 500) {
              return false;
            }
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Default mutation options
        retry: false,
      },
    },
  });
}
