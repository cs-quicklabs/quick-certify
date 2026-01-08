'use client';

import { Header, Sidebar } from '@/components';

export default function ProfileSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="px-2 py-6 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <Sidebar />
          </aside>
          <div className="max-w-xl pb-12 px-4 lg:col-span-6">{children}</div>
        </div>
      </main>
    </>
  );
}
