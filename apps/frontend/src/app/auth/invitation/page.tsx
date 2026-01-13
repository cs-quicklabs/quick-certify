'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Input, Button, Alert } from '@/components';
import { acceptInvitationSchema, AcceptInvitationFormData } from '@/schemas/auth.schema';
import { authService, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * Accept Invitation Page
 *
 * Flow:
 * 1. Validate token on page load
 * 2. Show password form if token is valid
 * 3. On submit, accept invitation and login user
 */
export default function AcceptInvitationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuthStore();
    const [serverError, setServerError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValid, setIsValid] = useState(false);

    const token = searchParams.get('token');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AcceptInvitationFormData>({
        resolver: zodResolver(acceptInvitationSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    // Validate token on page load
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setServerError('Invalid invitation link. Please contact your administrator.');
                setIsValidating(false);
                return;
            }

            // Token validation happens when we try to accept the invitation
            // For now, we'll just check if token exists and show the form
            // The backend will validate the token when the form is submitted
            setIsValid(true);
            setIsValidating(false);
        };

        validateToken();
    }, [token]);

    const onSubmit = async (data: AcceptInvitationFormData) => {
        if (!token) return;
        setServerError(null);

        try {
            // Accept invitation (this validates the token and sets password)
            const tokens = await authService.acceptInvitation({
                token,
                password: data.password,
            });

            // Fetch user info
            const user = await authService.getCurrentUser();
            setUser(user);

            setIsSuccess(true);
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (error) {
            const axiosError = error as AxiosError<ApiError>;
            const message = getApiErrorMessage(axiosError, 'An error occurred. Please try again.');
            setServerError(message);
        }
    };

    // Show loading state while validating
    if (isValidating) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Validating Invitation...
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we verify your invitation link.
                    </p>
                </div>
            </div>
        );
    }

    // Show error if token is invalid
    if (!isValid || !token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <svg
                                    className="w-8 h-8 text-red-600 dark:text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Invalid Invitation Link
                        </h1>
                        {serverError && (
                            <p className="text-red-600 dark:text-red-400 mb-4">{serverError}</p>
                        )}
                    </div>
                    <div className="space-y-3">
                        <Link
                            href="/login"
                            className="block w-full px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors text-center"
                        >
                            Go to Login
                        </Link>
                        <Link
                            href="/"
                            className="block w-full px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 transition-colors text-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Show success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invitation Accepted!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Your account has been activated. Redirecting to dashboard...
                    </p>
                    <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    // Show password form
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-2">
                    Accept Invitation
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Set your password to activate your account and join the team.
                </p>

                {serverError && (
                    <Alert
                        type="error"
                        message={serverError}
                        onClose={() => setServerError(null)}
                        className="mb-6"
                    />
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        showPasswordToggle
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        showPasswordToggle
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                        Accept Invitation
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

