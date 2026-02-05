'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { ArrowLeft, Mail } from 'lucide-react';
import { Input, Button, Alert } from '@/components';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/schemas/auth.schema';
import { authService, ApiError } from '@/services';

/**
 * Forgot Password Page
 */
export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);

    try {
      await authService.forgotPassword({ email: data.email });
      setIsSuccess(true);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message || 'An error occurred. Please try again.';
      setServerError(message);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          If an account exists with that email, we&apos;ve sent you a password reset link.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
      {/* Header */}
      <h1 className="text-xl pre font-extrabold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-4 lg:mb-5">
        Forgot Password?
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Enter email to recover password"
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Send Reset Password Instructions
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-sm font-light text-gray-500 dark:text-gray-400 text-center mt-2">
        <Link href="/login" className="link">
          Return Back to Login
        </Link>
      </div>
    </div>
  );
}
