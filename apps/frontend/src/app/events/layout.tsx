'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header, Logo } from '@/components';
import { useAuthStore } from '@/store/auth.store';

export default function EventsLayout({ children }: { children: React.ReactNode }) {
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Logo size="lg" asLink={false} />
        <div className="mt-6 flex items-center gap-2 text-gray-600 dark:text-gray-400">
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
    <>
      <Header />
      <main className="bg-gray-50 dark:bg-gray-900 py-3 sm:py-5 min-h-screen">
        <div className="px-4 mx-auto max-w-screen-2xl lg:px-8">{children}</div>
      </main>
    </>
  );
}
