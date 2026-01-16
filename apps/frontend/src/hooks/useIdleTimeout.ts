/**
 * Idle Timeout Hook
 *
 * Implements 30-minute idle timeout with activity tracking
 * - Tracks user activity (mouse, keyboard, touch, scroll, focus)
 * - Resets idle timer on activity
 * - Proactively refreshes token before logout
 * - Logs out only when idle time exceeded OR refresh token expired
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services';
import { getRefreshToken, clearTokens } from '@/services/api/api-client';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_BEFORE_LOGOUT_MS = 5 * 60 * 1000; // Refresh 5 minutes before logout (at 25 minutes)
const ACTIVITY_DEBOUNCE_MS = 2000; // Debounce activity events to 2 seconds
const MIN_RESET_INTERVAL_MS = 5000; // Minimum 5 seconds between timer resets (performance optimization)

/**
 * Events that indicate user activity
 * Note: Removed 'mousemove' and 'scroll' as they fire too frequently
 * 'mousedown', 'keydown', 'touchstart', 'click' are sufficient for activity detection
 */
const ACTIVITY_EVENTS = [
    'mousedown',
    'keydown',
    'touchstart',
    'click',
] as const;

/**
 * Hook to handle idle timeout and auto-logout
 *
 * Behavior:
 * 1. Tracks user activity and resets idle timer
 * 2. Proactively refreshes token at 25 minutes (5 min before 30-min timeout)
 * 3. Logs out after 30 minutes of inactivity
 * 4. Logs out if refresh token is expired
 */
export function useIdleTimeout() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const lastResetRef = useRef<number>(0); // Track last timer reset time
    const isRefreshingRef = useRef<boolean>(false);
    const activityDebounceRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Log activity for debugging
     */
    const logActivity = useCallback((message: string, data?: unknown) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[IdleTimeout] ${message}`, data || '');
        }
    }, []);

    /**
     * Handle user activity - reset idle timer (optimized for performance)
     */
    const handleActivity = useCallback(() => {
        const now = Date.now();

        // Update last activity time immediately (no debounce for this)
        lastActivityRef.current = now;

        // Debounce timer reset to avoid excessive resets
        if (activityDebounceRef.current) {
            clearTimeout(activityDebounceRef.current);
        }

        activityDebounceRef.current = setTimeout(() => {
            const timeSinceLastReset = now - lastResetRef.current;

            // Performance optimization: Only reset timer if enough time has passed since last reset
            // This prevents constant timer resets when user is actively using the app
            if (timeSinceLastReset < MIN_RESET_INTERVAL_MS) {
                // Skip reset if we just reset recently (within last 5 seconds)
                return;
            }

            const timeSinceLastActivity = now - lastActivityRef.current;

            // Only log if significant time has passed (avoid spam)
            if (timeSinceLastActivity > 10000) {
                logActivity('Activity detected - resetting idle timer', {
                    timeSinceLastActivity: `${Math.round(timeSinceLastActivity / 1000)}s`,
                });
            }

            resetIdleTimer();
        }, ACTIVITY_DEBOUNCE_MS);
    }, [logActivity]);

    /**
     * Proactively refresh token before logout
     */
    const refreshTokenProactively = useCallback(async () => {
        if (isRefreshingRef.current) {
            logActivity('Token refresh already in progress, skipping');
            return;
        }

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            logActivity('No refresh token available, cannot refresh');
            return;
        }

        isRefreshingRef.current = true;
        logActivity('Proactively refreshing token (5 min before logout)');

        try {
            await authService.refreshToken(refreshToken);
            logActivity('Token refreshed successfully');
            // Reset idle timer after successful refresh
            resetIdleTimer();
        } catch (error) {
            logActivity('Token refresh failed', error);
            // If refresh fails, check if it's because token expired
            // If so, logout immediately
            handleLogout('Refresh token expired or invalid');
        } finally {
            isRefreshingRef.current = false;
        }
    }, [logActivity]);

    /**
     * Handle logout due to idle timeout
     */
    const handleLogout = useCallback((reason: string) => {
        logActivity(`Logging out: ${reason}`);

        // Clear timers
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        // Clear tokens and storage
        clearTokens();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
        }

        // Clear user from store
        setUser(null);

        // Redirect to login
        router.push('/login');
    }, [logActivity, router, setUser]);

    /**
     * Reset idle timer (optimized to avoid unnecessary resets)
     */
    const resetIdleTimer = useCallback(() => {
        // Clear existing timers
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }

        // Only set timers if user is authenticated
        if (!user) {
            return;
        }

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            logActivity('No refresh token, logging out immediately');
            handleLogout('No refresh token available');
            return;
        }

        // Update last reset time (for performance optimization)
        lastResetRef.current = Date.now();

        // Calculate time until refresh and logout based on last activity
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        const timeUntilRefresh = Math.max(0, TOKEN_REFRESH_BEFORE_LOGOUT_MS - timeSinceLastActivity);
        const timeUntilLogout = Math.max(0, IDLE_TIMEOUT_MS - timeSinceLastActivity);

        // Set timer to refresh token proactively (at 25 minutes from last activity)
        if (timeUntilRefresh > 0) {
            refreshTimerRef.current = setTimeout(() => {
                refreshTokenProactively();
            }, timeUntilRefresh);
        }

        // Set timer for final logout (at 30 minutes from last activity)
        if (timeUntilLogout > 0) {
            idleTimerRef.current = setTimeout(() => {
                const finalTimeSinceLastActivity = Date.now() - lastActivityRef.current;
                const idleMinutes = Math.round(finalTimeSinceLastActivity / 60000);

                logActivity(`Idle timeout reached (${idleMinutes} minutes of inactivity)`);
                handleLogout(`30 minutes of inactivity`);
            }, timeUntilLogout);
        }

        logActivity('Idle timer reset', {
            refreshIn: `${Math.round(timeUntilRefresh / 60000)} minutes`,
            logoutIn: `${Math.round(timeUntilLogout / 60000)} minutes`,
        });
    }, [user, logActivity, refreshTokenProactively, handleLogout]);

    /**
     * Handle visibility change (tab focus/blur)
     */
    const handleVisibilityChange = useCallback(() => {
        if (document.visibilityState === 'visible') {
            logActivity('Tab became visible - checking activity');
            // When tab becomes visible, check if we should refresh token
            const timeSinceLastActivity = Date.now() - lastActivityRef.current;
            if (timeSinceLastActivity > TOKEN_REFRESH_BEFORE_LOGOUT_MS) {
                // We've been away for a while, try to refresh token
                refreshTokenProactively();
            } else {
                // Reset timer since user is back
                resetIdleTimer();
            }
        } else {
            logActivity('Tab became hidden');
            // Don't reset timer when tab is hidden - let idle timeout continue
        }
    }, [logActivity, refreshTokenProactively, resetIdleTimer]);

    /**
     * Initialize idle timeout when user is authenticated
     */
    useEffect(() => {
        if (!user) {
            // Clear timers if user logs out
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
            if (activityDebounceRef.current) {
                clearTimeout(activityDebounceRef.current);
                activityDebounceRef.current = null;
            }
            return;
        }

        // Initialize timers
        lastActivityRef.current = Date.now();
        resetIdleTimer();

        // Add activity event listeners
        ACTIVITY_EVENTS.forEach((event) => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            ACTIVITY_EVENTS.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
            if (activityDebounceRef.current) {
                clearTimeout(activityDebounceRef.current);
            }
        };
    }, [user, handleActivity, handleVisibilityChange, resetIdleTimer]);
}
