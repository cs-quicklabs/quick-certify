'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from '@/components';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Authentication failed';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="mb-8">
        <Logo size="lg" asLink={false} />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Authentication Failed
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 transition-colors"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="block w-full px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 transition-colors dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

function AuthErrorSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="mb-8">
        <Logo size="lg" asLink={false} />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorSkeleton />}>
      <AuthErrorContent />
    </Suspense>
  );
}
