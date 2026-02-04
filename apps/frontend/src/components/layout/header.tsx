'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useProfile } from '@/hooks/useSettings';
import { ConfirmationDialog } from '@/components/ui';
import { getInitials } from '@/utils';

export function Header() {
  const [menuOpened, setMenuOpened] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuthStore();
  const { data: profile } = useProfile();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpened(false);
      }
    }
    if (menuOpened) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpened]);

  // Get avatar URL from profile (most up-to-date) or fallback to user or default
  const avatarUrl = profile?.avatarUrl || user?.avatarUrl || '';

  const handleSignOutClick = () => {
    setMenuOpened(false);
    setMobileMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleSignOutConfirm = async () => {
    setShowLogoutConfirm(false);
    await logout();
    window.location.href = '/login';
  };

  // Check if user is admin or super_admin
  const isAdminOrSuperAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSystemAdmin = user?.role === 'system_admin';

  return (
    <nav className="sticky top-0 z-50 bg-gray-800">
      <div className="mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-12 items-center justify-between">
          <div className="flex items-center px-2 lg:px-0">
            <Link href="/dashboard">
              <div className="shrink-0 flex items-center">
                <span
                  data-cy="Quick Test-label"
                  className="text-white font-bold font-mono px-3 hidden lg:block tracking-wider"
                >
                  Quick Certify
                </span>
                <span className="text-white font-medium px-3 block lg:hidden"></span>
              </div>
            </Link>
            <div className="hidden lg:ml-4 lg:block">
              <div className="flex space-x-1">
                {isSystemAdmin ? (
                  <Link href="/admin/organizations" className="selected-nav">
                    Organizations
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard" className="selected-nav">
                      Dashboard
                    </Link>
                    <Link href="/events" className="unselected-nav">
                      Events
                    </Link>
                    <Link href="/credentials" className="unselected-nav">
                      Credentials
                    </Link>
                    <Link href="/designs" className="unselected-nav">
                      Designs
                    </Link>
                    <Link href="/emails" className="unselected-nav">
                      Emails
                    </Link>
                    <Link href="/analytics" className="unselected-nav">
                      Analytics
                    </Link>
                    <Link href="/integrations" className="unselected-nav">
                      Integrations
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"></div>
                <input
                  id="search"
                  name="search"
                  className="block w-full form-input-field"
                  placeholder="Search Events or Participants"
                  type="search"
                />
              </div>
            </div>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-sm p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="hidden lg:ml-4 lg:block">
            <div className="flex items-center">
              <button
                type="button"
                className="shrink-0 rounded-full  p-1 text-gray-400 hover:text-blue  focus:ring-2  focus:ring-offset-blue-800 cursor-pointer"
              >
                <span className="sr-only">View notifications</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </button>
              {/* Profile dropdown */}
              <div className="relative ml-2 shrink-0" ref={dropdownRef}>
                <div className="relative ml-2 flex-shrink-0">
                  <div>
                    <button
                      onClick={() => setMenuOpened(!menuOpened)}
                      type="button"
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      {avatarUrl && (
                        <img
                          className="h-full w-full rounded-full object-cover"
                          src={avatarUrl}
                          alt={user?.firstName || 'User'}
                        />
                      )}
                      {!avatarUrl && (
                        <span className="text-lg font-medium">
                          {getInitials(user?.firstName, user?.lastName)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                {menuOpened && (
                  <div
                    className="absolute right-0 z-10 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg border border-gray-200 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex={-1}
                  >
                    <div className="px-4 py-3" role="none">
                      <p
                        className="text-sm break-words max-w-xs"
                        role="none"
                        style={{ wordBreak: 'break-all' }}
                      >
                        {user?.email || 'User'}
                      </p>
                      {!isSystemAdmin && (
                        <p className="text-xs text-gray-500" role="none">
                          {profile?.organizationName || ''}
                        </p>
                      )}
                    </div>
                    <div className="py-1" role="none">
                      {isSystemAdmin ? (
                        <Link
                          href="/admin/organizations"
                          className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                          role="menuitem"
                          tabIndex={-1}
                        >
                          Organizations
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/settings/profile/general"
                            className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                            role="menuitem"
                            tabIndex={-1}
                          >
                            Profile Settings
                          </Link>
                          {isAdminOrSuperAdmin && (
                            <Link
                              href="/settings/account/general-information"
                              className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                              role="menuitem"
                              tabIndex={-1}
                            >
                              Account Settings
                            </Link>
                          )}
                          {isAdminOrSuperAdmin && (
                            <Link
                              href="/settings/event/type"
                              className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                              role="menuitem"
                              tabIndex={-1}
                            >
                              Event Settings
                            </Link>
                          )}
                          {isAdminOrSuperAdmin && (
                            <Link
                              href="/settings/team"
                              className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                              role="menuitem"
                              tabIndex={-1}
                            >
                              Team
                            </Link>
                          )}
                          {isAdminOrSuperAdmin && (
                            <Link
                              href="/settings/archived"
                              className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                              role="menuitem"
                              tabIndex={-1}
                            >
                              Archived
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                    <div className="py-1" role="none">
                      <button
                        type="button"
                        onClick={handleSignOutClick}
                        className="hover:bg-gray-50 text-gray-700 block w-full px-4 py-2 text-left text-sm cursor-pointer"
                        role="menuitem"
                        tabIndex={-1}
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
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {isSystemAdmin ? (
              <Link
                href="/admin/organizations"
                className="block rounded-sm bg-gray-900 px-3 py-2 text-base font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Organizations
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="block rounded-sm bg-gray-900 px-3 py-2 text-base font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/events"
                  className="block rounded-sm px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Events
                </Link>
                <Link
                  href="/credentials"
                  className="block rounded-sm px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Credentials
                </Link>
                <Link
                  href="/designs"
                  className="block rounded-sm px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Designs
                </Link>
                <Link
                  href="/emails"
                  className="block rounded-sm px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Emails
                </Link>
                <Link
                  href="/analytics"
                  className="block rounded-sm px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  href="/integrations"
                  className="block rounded-sm px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Integrations
                </Link>
              </>
            )}
          </div>
          <div className="border-t border-gray-700 pb-3 pt-4">
            <div className="flex items-center px-5">
              <div className="shrink-0 flex items-center justify-center h-10 w-10 bg-gray-400 rounded-full text-white">
                {avatarUrl && (
                  <img
                    className="h-full w-full rounded-full object-cover"
                    src={avatarUrl}
                    alt={user?.firstName || 'User'}
                  />
                )}
                {!avatarUrl && (
                  <span className="text-lg font-medium">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm font-medium text-gray-400">{user?.email || 'User'}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              {isSystemAdmin ? (
                <Link
                  href="/admin/organizations"
                  className="block rounded-sm px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Organizations
                </Link>
              ) : (
                <>
                  <Link
                    href="/settings/profile/general"
                    className="block rounded-sm px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  {isAdminOrSuperAdmin && (
                    <Link
                      href="/settings/account/general-information"
                      className="block rounded-sm px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                  )}
                  {isAdminOrSuperAdmin && (
                    <Link
                      href="/settings/event/type"
                      className="block rounded-sm px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Event Settings
                    </Link>
                  )}
                  {isAdminOrSuperAdmin && (
                    <Link
                      href="/settings/team"
                      className="block rounded-sm px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Team
                    </Link>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={handleSignOutClick}
                className="block w-full rounded-sm px-3 py-2 text-left text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Yes I 'm sure"
        cancelLabel="cancel"
        confirmVariant="danger"
        onConfirm={handleSignOutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </nav>
  );
}
