import { NextRequest, NextResponse } from 'next/server';

/**
 * Route Configuration
 *
 * Define protected and public routes for middleware-based access control.
 * This provides server-side route protection to prevent flash of protected content.
 */

// Routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/settings',
    '/events',
    '/credentials',
    '/designs',
    '/emails',
    '/analytics',
    '/integrations',
];

// Routes only accessible to unauthenticated users
const authRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/invitation',
];

// Public routes accessible to everyone
const publicRoutes = ['/', '/auth/error', '/auth/google/callback'];

/**
 * Check if a path matches any of the defined routes
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
    return routes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

/**
 * Next.js Middleware
 *
 * Handles route protection at the edge before the page is rendered.
 * This prevents the flash of protected content that occurs with client-side checks.
 *
 * Token Strategy:
 * - Checks for accessToken in cookies (preferred, httpOnly)
 * - Falls back to checking localStorage via client-side (not available in middleware)
 *
 * Since localStorage is not available in middleware, we check cookies.
 * The client should sync tokens to cookies for middleware to work properly.
 * Alternatively, this middleware provides a foundation for when httpOnly cookies are implemented.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookies
    // Note: For full security, tokens should be in httpOnly cookies set by the backend
    const accessToken = request.cookies.get('accessToken')?.value;

    // Check route type
    const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
    const isAuthRoute = matchesRoute(pathname, authRoutes);
    const isPublicRoute = matchesRoute(pathname, publicRoutes);

    // If it's a public route, allow access
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // If accessing auth routes while authenticated, redirect to dashboard
    if (isAuthRoute && accessToken) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // If accessing protected routes without authentication, redirect to login
    if (isProtectedRoute && !accessToken) {
        const loginUrl = new URL('/login', request.url);
        // Preserve the original URL to redirect back after login
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

/**
 * Matcher Configuration
 *
 * Exclude static files, API routes, and Next.js internals from middleware.
 * This improves performance by only running middleware on actual page requests.
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
