'use client';

import { Logo } from '@/components/';
import Link from 'next/link';

export function ModulePermissionError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" asLink={false} />
        </div>

        <p className="text-sm text-gray-500">You do not have permission to access this module.</p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
