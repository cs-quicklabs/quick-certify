'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { User, Lock, Mail } from 'lucide-react';

/**
 * Settings Sidebar Navigation
 */
const settingsNavItems = [
  { name: 'Profile', href: '/settings/profile', icon: User },
  { name: 'Change Password', href: '/settings/password', icon: Lock },
  { name: 'Email Preferences', href: '/settings/email', icon: Mail },
];

/**
 * Settings Layout
 *
 * Shared layout for settings pages with sidebar navigation
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400 border-l-4 border-primary-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent',
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
