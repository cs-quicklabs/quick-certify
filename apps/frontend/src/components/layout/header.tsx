'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useProfile } from '@/hooks/useSettings';
import { ConfirmationDialog } from '@/components/ui';
import { Search } from 'lucide-react';
import { getInitials } from '@/utils';
import { usePathname } from 'next/navigation';
import { RoleType } from '@/types';

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/events', label: 'Events' },
  { href: '/credentials', label: 'Credentials' },
  { href: '/pathways', label: 'Pathways' },
  { href: '/designs', label: 'Designs' },
  // { href: '/emails', label: 'Emails' },
  // { href: '/analytics', label: 'Analytics' },
  // { href: '/integrations', label: 'Integrations' },
];

const SYSTEM_ADMIN_NAV: NavItem[] = [{ href: '/admin/organizations', label: 'Organizations' }];

const getDropdownItems = (isAdmin: boolean): NavItem[] => {
  const items: NavItem[] = [{ href: '/settings/profile/general', label: 'Profile Settings' }];
  if (isAdmin) {
    items.push(
      { href: '/settings/account/general-information', label: 'Account Settings' },
      { href: '/settings/event/type', label: 'Event Settings' },
      { href: '/settings/team', label: 'Team' },
      { href: '/settings/archived', label: 'Archived' },
    );
  }
  return items;
};

type AvatarProps = { avatarUrl: string; firstName?: string; lastName?: string; size?: 'sm' | 'lg' };

function Avatar({ avatarUrl, firstName, lastName, size = 'sm' }: AvatarProps) {
  const cls = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  return (
    <div
      className={`${cls} flex items-center justify-center rounded-full bg-gray-400 text-white overflow-hidden`}
    >
      {avatarUrl ? (
        <img className="h-full w-full object-cover" src={avatarUrl} alt={firstName || 'User'} />
      ) : (
        <span className="text-lg font-medium">{getInitials(firstName, lastName)}</span>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpened, setMenuOpened] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuthStore();
  const { data: profile } = useProfile();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpened) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpened(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpened]);

  const avatarUrl = profile?.avatarUrl || user?.avatarUrl || '';
  const isAdmin =
    (user?.role && [RoleType.SuperAdmin, RoleType.Admin].includes(user?.role as RoleType)) || false;
  const isSystemAdmin = user?.role === RoleType.SystemAdmin;
  const navItems = isSystemAdmin ? [...NAV_ITEMS, ...SYSTEM_ADMIN_NAV] : NAV_ITEMS;
  const dropdownItems = isSystemAdmin
    ? [...SYSTEM_ADMIN_NAV, ...getDropdownItems(true)]
    : getDropdownItems(isAdmin);

  const closeMenus = () => {
    setMenuOpened(false);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    closeMenus();
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = async () => {
    setShowLogoutConfirm(false);
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-800">
      <div className="mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-12 items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center px-2 lg:px-0">
            <Link
              href="/dashboard"
              className="text-white font-bold font-mono px-3 hidden lg:block tracking-wider"
            >
              Quick Certify
            </Link>
            <div className="hidden lg:ml-4 lg:flex space-x-1">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname.includes(item.href) ? 'selected-nav' : 'unselected-nav'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full rounded-md border border-transparent bg-gray-700 py-1.5 pl-10 pr-3 leading-5 text-gray-300 placeholder-gray-400 focus:border-white focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                  placeholder="Search Events or Participants"
                  type="search"
                />
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center rounded-sm p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  mobileMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                }
              />
            </svg>
          </button>

          {/* Desktop Profile */}
          <div className="hidden lg:flex items-center ml-4">
            <button type="button" className="rounded-full p-1 text-gray-400 hover:text-blue">
              <span className="sr-only">Notifications</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </button>

            <div className="relative ml-2" ref={dropdownRef}>
              <button onClick={() => setMenuOpened(!menuOpened)} className="cursor-pointer">
                <Avatar
                  avatarUrl={avatarUrl}
                  firstName={user?.firstName}
                  lastName={user?.lastName}
                />
              </button>
              {menuOpened && (
                <div className="absolute right-0 z-10 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg border border-gray-200">
                  <div className="px-4 py-3">
                    <p className="text-sm break-all">{user?.email}</p>
                    <p className="text-xs text-gray-500">{profile?.organizationName}</p>
                  </div>
                  <div className="py-1">
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="hover:bg-gray-50 text-gray-700 block w-full px-4 py-2 text-left text-sm cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenus}
                className={`block rounded-sm px-3 py-2 text-base font-medium ${
                  i === 0
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-700 pb-3 pt-4">
            <div className="flex items-center px-5">
              <Avatar
                avatarUrl={avatarUrl}
                firstName={user?.firstName}
                lastName={user?.lastName}
                size="lg"
              />
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm font-medium text-gray-400">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              {dropdownItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenus}
                  className="block rounded-sm px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="block w-full rounded-sm px-3 py-2 text-left text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Yes I'm sure"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmSignOut}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </nav>
  );
}
