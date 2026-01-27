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
      <main className="max-w-8xl mx-auto pb-10 lg:py-2 lg:px-8">
        <div className="px-16">{children}</div>
      </main>
    </>
  );
}
