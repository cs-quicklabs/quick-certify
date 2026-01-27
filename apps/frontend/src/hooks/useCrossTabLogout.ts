/**
 * Cross-Tab Logout Hook
 *
 * Listens for storage events to detect when a user logs in from another tab
 * and automatically logs out the current tab to prevent multiple simultaneous sessions.
 * The storage event only fires in OTHER tabs, not the current one where login happens.
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getSessionId, SESSION_ID_KEY } from '@/services';

/**
 * Hook to handle cross-tab logout
 *
 * When a user logs in from another browser tab, this hook detects the change
 * in localStorage (specifically the session ID) and logs out OTHER tabs only.
 * The current tab (where login happens) is never logged out because the storage
 * event does not fire in the tab that made the change.
 */
export function useCrossTabLogout() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currentSessionId = useRef<string | null>(null);
  const isLoggingOut = useRef(false);
  // Grace period: ignore storage events shortly after login to prevent cascade
  const loginTimestamp = useRef<number>(0);
  const LOGIN_GRACE_PERIOD_MS = 2000; // 2 seconds

  // Sync session ID when user state changes (e.g., after login in current tab)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoggingOut.current) {
      const sessionId = getSessionId();
      // Update ref when user logs in (user changes from null to user object)
      if (user && sessionId) {
        currentSessionId.current = sessionId;
        // Mark login timestamp to create grace period
        loginTimestamp.current = Date.now();
      } else if (!user) {
        currentSessionId.current = null;
      }
    }
  }, [user]);

  useEffect(() => {
    // Initialize current session ID on mount
    if (typeof window !== 'undefined') {
      currentSessionId.current = getSessionId();
    }

    /**
     * Handle storage events from other tabs
     *
     * IMPORTANT: The storage event ONLY fires in OTHER tabs/windows, NOT in the
     * current tab where the change occurred. This is browser behavior.
     *
     * So when a user logs in Tab A:
     * - Tab A sets new session ID (no storage event fires in Tab A)
     * - Storage event fires in Tab B, Tab C, etc.
     * - Tab B, Tab C detect the change and logout
     * - Tab A continues normally (no logout)
     */
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle changes to the session ID key
      if (e.key !== SESSION_ID_KEY) return;

      // If the value was removed (logout in another tab), update our ref
      if (!e.newValue) {
        if (!isLoggingOut.current) {
          currentSessionId.current = null;
        }
        return;
      }

      // If we have a user logged in and the session ID changed,
      // it means a new login happened in another tab - logout this tab
      // This event only fires in OTHER tabs, never in the tab where login happened
      if (user && e.newValue !== currentSessionId.current && currentSessionId.current !== null) {
        // Skip if we're within the grace period after login (prevents cascade from other tabs clearing storage)
        if (Date.now() - loginTimestamp.current < LOGIN_GRACE_PERIOD_MS) {
          return;
        }

        isLoggingOut.current = true;

        // DON'T clear tokens from localStorage - they belong to the new session in the other tab
        // Only clear this tab's local state and redirect
        if (typeof window !== 'undefined') {
          // Clear auth store (Zustand persist storage) for this tab's memory state
          localStorage.removeItem('auth-storage');
          // Clear React Query cache
          localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
        }
        // Clear user from store (logout doesn't need to call API since session is invalid)
        useAuthStore.getState().setUser(null);
        // Redirect to login
        router.push('/login');
        return;
      }

      // Update current session ID if it changed (but we didn't logout)
      if (!isLoggingOut.current) {
        currentSessionId.current = e.newValue;
      }
    };

    // Add event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [user, router]); // Include 'user' so handler has current user value
}
