'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useProfile } from '@/hooks/useSettings';
import { ConfirmationDialog } from '@/components/ui';
import { GlobalSearch } from './global-search';
import { capitalizeFirst } from '@/utils';
import { usePathname } from 'next/navigation';
import { RoleType } from '@/types';
import { ROUTES } from '@/config/routes';
import { HeaderAvatar } from './HeaderAvatar';
import {
  ROLE_BADGE_STYLES,
  NAV_ITEMS,
  SYSTEM_ADMIN_NAV,
  getDropdownItems,
} from '@/config/headerNav.config';

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
    window.location.href = ROUTES.AUTH.LOGIN;
  };

  return (
    <nav className="sticky top-0 bg-gray-800 z-30">
      <div className="mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-12 items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center px-2 lg:px-0">
            <Link
              href={ROUTES.DASHBOARD.HOME}
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

          {/* Search — only for admin-level roles */}
          {(isAdmin || isSystemAdmin) && <GlobalSearch />}

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
            <div className="relative ml-2" ref={dropdownRef}>
              <button onClick={() => setMenuOpened(!menuOpened)} className="cursor-pointer">
                <HeaderAvatar
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
                    {user?.role && (
                      <span
                        className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE_STYLES[user.role] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {capitalizeFirst(user.role.replace('_', ' '))}
                      </span>
                    )}
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
              <HeaderAvatar
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
