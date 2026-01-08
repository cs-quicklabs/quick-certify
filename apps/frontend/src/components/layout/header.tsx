'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Search,
  Bell,
  User,
  Settings,
  Users,
  Calendar,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Navigation Items
 */
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Events', href: '/events' },
  { name: 'Credentials', href: '/credentials' },
  { name: 'Designs', href: '/designs' },
  { name: 'Emails', href: '/emails' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Integrations', href: '/integrations' },
];

/**
 * Profile Menu Items
 */
const profileMenuItems = [
  { name: 'Profile Settings', href: '/settings/profile', icon: User },
  { name: 'Account Settings', href: '/settings/account', icon: Settings },
  { name: 'Event Settings', href: '/settings/events', icon: Calendar },
  { name: 'Team', href: '/settings/team', icon: Users },
];

/**
 * Dashboard Header Component
 */
export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await logout();
    window.location.href = '/login';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-primary-700 dark:bg-gray-800 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.2" />
                  <path
                    d="M10 16L14 20L22 12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-white font-bold text-lg hidden sm:block">Quick Certify</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-800 text-white'
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white',
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search + Notifications + Profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Events or Participants"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-primary-600/50 border border-primary-500 rounded-lg text-sm text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-full text-primary-100 hover:text-white hover:bg-primary-600 transition-colors"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-primary-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium ring-2 ring-primary-400">
                  {getUserInitials()}
                </div>
                <ChevronDown
                  className={clsx(
                    'h-4 w-4 text-primary-200 transition-transform hidden sm:block',
                    isProfileOpen && 'rotate-180',
                  )}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {user?.role || 'Member'}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Icon className="h-4 w-4 text-gray-400" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-primary-100 hover:text-white hover:bg-primary-600 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-primary-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <div className="px-2 pb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-sm text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            {/* Mobile Nav Items */}
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'block px-3 py-2 rounded-md text-base font-medium',
                    isActive
                      ? 'bg-primary-900 text-white'
                      : 'text-primary-100 hover:bg-primary-700 hover:text-white',
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

