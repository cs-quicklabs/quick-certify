'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Alert } from '@/components';
import { googleSignupCompleteSchema, GoogleSignupCompleteFormData } from '@/schemas/auth.schema';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import { getApiErrorMessage } from '@/lib/api-error';

function CompleteSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const googleToken = searchParams.get('googleToken');
  const tempToken = searchParams.get('tempToken');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoogleSignupCompleteFormData>({
    resolver: zodResolver(googleSignupCompleteSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      websiteUrl: '',
    },
  });

  // Redirect if no token
  useEffect(() => {
    if (!googleToken && !tempToken) {
      router.push('/signup');
    } else {
      setIsReady(true);
    }
  }, [googleToken, tempToken, router]);

  const onSubmit = async (data: GoogleSignupCompleteFormData) => {
    setServerError(null);

    try {
      await authService.completeGoogleSignup({
        idToken: googleToken || undefined,
        tempToken: tempToken || undefined,
        firstName: data.firstName,
        lastName: data.lastName,
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

  if (!isReady) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 sm:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Tell us more about your issuer account
        </h1>

        {/* Server Error Alert */}
        {serverError && (
          <Alert
            type="error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
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

          <Input
            label="Issuer name"
            placeholder="Acme Corporation"
            error={errors.companyName?.message}
            {...register('companyName')}
          />

          <Input
            label="Issuer Website URL"
            type="url"
            placeholder="https://acme.com"
            error={errors.websiteUrl?.message}
            {...register('websiteUrl')}
          />

          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Complete profile and go to Dashboard
          </Button>

          {/* Login link */}
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function CompleteSignupSkeleton() {
  return (
    <div className="p-6 sm:p-8 space-y-4 md:space-y-6 animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-72 mb-6"></div>
      <div className="space-y-4 md:space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

export default function CompleteSignupPage() {
  return (
    <Suspense fallback={<CompleteSignupSkeleton />}>
      <CompleteSignupContent />
    </Suspense>
  );
}
