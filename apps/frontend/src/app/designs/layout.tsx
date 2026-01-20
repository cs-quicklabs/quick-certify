'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header, Logo } from '@/components';
import { useAuthStore } from '@/store/auth.store';

export default function DesignsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.push('/login');
    }
  }, [user, isInitialized, isLoading, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Logo size="lg" asLink={false} />
        <div className="mt-4 flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="px-4 mx-auto max-w-screen-2xl lg:px-8 bg-gray-50 py-3 sm:py-5 min-h-screen ">
        {children}
      </main>

      {modal}
    </>
  );
}
