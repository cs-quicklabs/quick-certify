'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { CheckCircle2, CircleX } from 'lucide-react';
import { Input, Button, Alert } from '@/components';
import { resetPasswordSchema, ResetPasswordFormData } from '@/schemas/auth.schema';
import { authService, ApiError } from '@/services';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Redirect if no token
  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        const response = await authService.checkToken(token);
        if (response.success) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } else {
        router.push('/forgot-password');
      }
    };
    checkToken();
    const checkToken = async () => {
      if (token) {
        const response = await authService.checkToken(token);
        if (response.success) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } else {
        router.push('/forgot-password');
      }
    };
    checkToken();
  }, [token, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    setServerError(null);

    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message || 'An error occurred. Please try again.';
      setServerError(message);
    }
  };

  if (!token) {
    return null;
  }

  if (!isValidToken) {
    return (
      <div className="w-full p-6 bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <CircleX className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid token</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Token has been expired or already used.
          </p>
          <Link href="/forgot-password" className="btn-primary inline-block">
            Back to forgot password
          </Link>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="w-full p-6 bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <CircleX className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid token</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Token has been expired or already used.
          </p>
          <Link href="/forgot-password" className="btn-primary inline-block">
            Back to forgot password
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full p-6 bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Password reset successful
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
      <div>
        {/* Header */}
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-2">
          Set a new password
        </h1>

        {/* Server Error Alert */}
        {serverError && (
          <Alert
            type="error"
            message={serverError}
            onClose={() => setServerError(null)}
            className="mb-6"
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 lg:mt-5 md:space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.newPassword?.message}
            {...register('newPassword')}
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
            Change Password
          </Button>
          <div className="text-sm font-light text-gray-500 dark:text-gray-400 text-center">
            <Link href="/login" className="link">
              Return Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordSkeleton() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56 mb-6"></div>
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
