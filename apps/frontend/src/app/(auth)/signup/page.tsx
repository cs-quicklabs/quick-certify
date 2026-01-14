'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Alert, Divider, GoogleSignInButton } from '@/components';
import { registerSchema, RegisterFormData } from '@/schemas/auth.schema';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * Signup Page
 */
export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  // Check if user came from Google sign-in (with token in URL)
  const googleToken = searchParams.get('googleToken');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      companyName: '',
      websiteUrl: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      await authService.register({
        firstName: data.firstName,
        lastName: data.lastName || '',
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        companyName: data.companyName,
        websiteUrl: data.websiteUrl,
      });

      // Fetch current user after registration
      const user = await authService.getCurrentUser();
      setUser(user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <h1 className="text-xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-6">
        Register new issuer account
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

      {/* Google Token Notice */}
      {googleToken && (
        <Alert
          type="info"
          message="Complete your registration by providing the required details below."
          className="mb-6"
        />
      )}


      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Your email"
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Issuer name"
          placeholder="Issuer or company name"
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <Input
          label="Issuer Website URL"
          type="url"
          placeholder="Website URL"
          error={errors.websiteUrl?.message}
          {...register('websiteUrl')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting} disabled={isSubmitting}>
          Create New Issuer Account
        </Button>

        {/* Google Sign-Up (if no token) */}
        {!googleToken && (
          <>
            <GoogleSignInButton mode="signup" disabled={isSubmitting} />
          </>
        )}
      </form>

      {/* Login Link */}
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:underline dark:text-primary-500"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
