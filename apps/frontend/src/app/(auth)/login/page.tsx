'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Input, Checkbox, Button, Alert, GoogleSignInButton } from '@/components';
import { useLogin } from '@/hooks/auth/useLogin';
import { ROUTES } from '@/config/routes';

export default function LoginPage() {
  const { formMethods, onSubmit, globalError, clearError, isLoading } = useLogin();
  const {
    register,
    formState: { errors },
  } = formMethods;

  // Clear error on page mount/refresh
  useEffect(() => {
    clearError();
  }, [clearError]);

  return (
    <div className="w-full bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 sm:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Sign in to issuer account
        </h1>

        {/* Server Error Alert */}
        {globalError && <Alert type="error" message={globalError} onClose={clearError} />}

        {/* Login Form */}
        <form onSubmit={onSubmit} className="space-y-4 md:space-y-4">
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
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading}>
            Sign in
          </Button>

          {/* Google Sign-In */}
          <GoogleSignInButton mode="login" disabled={isLoading} />

          {/* Sign Up Link */}
          <p className="flex justify-center text-sm font-light text-gray-500 dark:text-gray-400">
            Don&apos;t have an account yet?{' '}
            <Link
              href={ROUTES.AUTH.REGISTER}
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
