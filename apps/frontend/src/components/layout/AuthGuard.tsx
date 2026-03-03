'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Logo } from '@/components/brand';
import { ROUTES } from '@/config/routes';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, isInitialized, isLoading, router]);

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

  if (!user) return null;
  return <>{children}</>;
}
