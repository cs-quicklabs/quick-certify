'use client';

import { AuthGuard, Header } from '@/components';

/**
 * Admin Organizations Layout
 *
 * Full-width layout for system admin organization management
 */
export default function AdminOrganizationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <main className="bg-gray-50 py-3 sm:py-5 min-h-screen">
        <div className="px-4 mx-auto max-w-screen-2xl lg:px-8">{children}</div>
      </main>
    </AuthGuard>
  );
}
