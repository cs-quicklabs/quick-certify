'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Input, Button, Alert } from '@/components';
import { googleSignupCompleteSchema, GoogleSignupCompleteFormData } from '@/schemas/auth.schema';
import { authService, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth.store';

/**
 * Complete Google Signup Page
 *
 * This page is shown when a new user signs up with Google
 * and needs to provide organization details.
 */
export default function CompleteSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const googleToken = searchParams.get('googleToken');
  const tempToken = searchParams.get('tempToken');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoogleSignupCompleteFormData>({
    resolver: zodResolver(googleSignupCompleteSchema),
    defaultValues: {
      companyName: '',
      websiteUrl: '',
    },
  });

  // Redirect if no token
  useEffect(() => {
    if (!googleToken && !tempToken) {
      router.push('/signup');
    }
  }, [googleToken, tempToken, router]);

  const onSubmit = async (data: GoogleSignupCompleteFormData) => {
    setServerError(null);

    try {
      await authService.completeGoogleSignup({
        idToken: googleToken || undefined,
        tempToken: tempToken || undefined,
        companyName: data.companyName,
        websiteUrl: data.websiteUrl,
      });

      // Fetch current user after registration
      const user = await authService.getCurrentUser();
      setUser(user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message || 'An error occurred. Please try again.';
      setServerError(message);
    }
  };

  if (!googleToken && !tempToken) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-2">
        Complete your account
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Just a few more details to get you started.
      </p>

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
          label="Company / Issuer name"
          placeholder="Acme Corporation"
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <Input
          label="Website URL"
          type="url"
          placeholder="https://company.com"
          error={errors.websiteUrl?.message}
          {...register('websiteUrl')}
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Complete setup
        </Button>
      </form>

      {/* Back to signup */}
      <div className="mt-6 text-center">
        <Link
          href="/signup"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign up
        </Link>
      </div>
    </div>
  );
}

