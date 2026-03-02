'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Header, Logo } from '@/components';

/**
 * Dashboard Layout
 *
 * Protected layout for authenticated users with header navigation
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.push('/login');
    }
  }, [user, isInitialized, isLoading, router]);

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Logo size="lg" asLink={false} />
        <div className="mt-6 flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render until authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="px-4 mx-auto max-w-screen-2xl lg:px-8 bg-gray-50 py-3 sm:py-5 min-h-screen ">
        {children}
      </main>
    </div>
  );
}
