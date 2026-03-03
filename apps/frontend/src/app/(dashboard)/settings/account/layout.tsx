import type { ReactNode } from 'react';
import { Sidebar } from '@/components';
import { accountSidebarItems } from '@/config/sidebar.config';

/**
 * Account Settings Layout
 *
 * Contains the sidebar navigation for account settings pages.
 * Only accessible by Super Admins.
 */
export default function AccountSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <aside className="px-2 py-6 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <Sidebar items={accountSidebarItems} />
        </aside>
        <div className="max-w-xl pb-12 px-4 lg:col-span-6">{children}</div>
      </div>
    </div>
  );
}
