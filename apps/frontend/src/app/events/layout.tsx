'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header, Sidebar, Logo } from '@/components';
import { eventSidebarItems } from '@/config/sidebar.config';
import { useAuthStore } from '@/store/auth.store';

/**
 * Events Layout
 *
 * Contains the sidebar navigation for events pages.
 * Similar to account settings layout.
 * Protected layout for authenticated users.
 */
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
      <main className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="px-2 py-6 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <Sidebar items={eventSidebarItems} />
          </aside>
          <div className="max-w-xl pb-12 px-4 lg:col-span-6">{children}</div>
        </div>
      </main>
    </>
  );
}
