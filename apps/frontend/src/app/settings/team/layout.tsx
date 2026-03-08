'use client';

import { Header } from '@/components';

/**
 * Team Settings Layout
 *
 * Full-width layout for team management pages without sidebar
 */
export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="bg-gray-50 py-3 sm:py-5 min-h-screen">
        <div className="px-4 mx-auto max-w-screen-2xl lg:px-8">{children}</div>
      </main>
    </>
  );
}
