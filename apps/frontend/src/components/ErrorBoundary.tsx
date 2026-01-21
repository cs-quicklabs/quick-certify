'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * Default Error Fallback Component
 * Displays a user-friendly error message with recovery options
 */
function ErrorFallback({
    error,
    resetError,
}: {
    error?: Error;
    resetError: () => void;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                {/* Error Title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Something went wrong
                </h1>

                {/* Error Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We encountered an unexpected error. Please try refreshing the page or
                    return to the homepage.
                </p>

                {/* Error Details (Development only) */}
                {process.env.NODE_ENV === 'development' && error && (
                    <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left overflow-auto">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                            {error.name}: {error.message}
                        </p>
                        {error.stack && (
                            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">
                                {error.stack.split('\n').slice(0, 5).join('\n')}
                            </pre>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={resetError}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 transition-colors dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error info:', errorInfo);

        // Update state with error info
        this.setState({ errorInfo });

        // TODO: Log to error monitoring service (e.g., Sentry, LogRocket)
        // Example:
        // errorMonitoringService.captureException(error, { extra: errorInfo });
    }

    resetError = (): void => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    override render(): ReactNode {
        if (this.state.hasError) {
            // Render custom fallback or default error UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorFallback
                    error={this.state.error}
                    resetError={this.resetError}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component to wrap components with error boundary
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent);
 * ```
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
