'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Checkbox, Button, Alert, GoogleSignInButton } from '@/components';
import { loginSchema } from '@/schemas/auth.schema';
import type { z } from 'zod';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import { getApiErrorMessage } from '@/lib/api-error';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setError: setGlobalError, clearError } = useAuthStore();
  const globalError = useAuthStore((state) => state.error);

  // Clear error on page mount/refresh
  useEffect(() => {
    clearError();
  }, [clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: z.output<typeof loginSchema>) => {
    clearError();

    try {
      await authService.login({
        email: data.email,
        password: data.password,
      });

      // Fetch current user after login
      const user = await authService.getCurrentUser();
      setUser(user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setGlobalError(getApiErrorMessage(error));
    }
  };

  return (
    <div className='w-full bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
      <div className="p-6 sm:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Sign in to issuer account
        </h1>

        {/* Server Error Alert */}
        {globalError && (
          <Alert
            type="error"
            message={globalError}
            onClose={clearError}
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-4">
          {/* Email Field */}
          <Input
            label="Your email"
            type="email"
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password Field */}
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between ">
            <Checkbox label="Remember me" {...register('rememberMe')} />
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Sign in
          </Button>

          {/* Google Sign-In */}
          <GoogleSignInButton mode="login" disabled={isSubmitting} />

          {/* Sign Up Link */}
          <p className="flex justify-center text-sm font-light text-gray-500 dark:text-gray-400">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/signup"
              className="ml-1 font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
