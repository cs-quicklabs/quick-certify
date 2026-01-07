'use client';

import { useState } from 'react';

export function Navbar() {
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-12 items-center justify-between">
          <div className="flex items-center px-2 lg:px-0">
            <a href="/quick-certify">
              <div className="flex-shrink-0 flex items-center">
                <span
                  data-cy="Quick Test-label"
                  className="text-white text-lg font-bold tracking-wide px-3 hidden lg:block"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  Quick Certify
                </span>
                <span className="text-white font-medium px-3 block lg:hidden"></span>
              </div>
            </a>
            <div className="hidden lg:ml-6 lg:block">
              <div className="flex space-x-2">
                <a href="/quick-certify/team" className="selected-nav">
                  Dashboard
                </a>
                <a href="/quick-certify/events" className="unselected-nav">
                  Events
                </a>
                <a href="/quick-certify/credentials" className="unselected-nav">
                  Credentials
                </a>
                <a href="/quick-certify/designs" className="unselected-nav">
                  Designs
                </a>
                <a href="/quick-certify/emails" className="unselected-nav">
                  Emails
                </a>
                <a href="/quick-certify/analytics" className="unselected-nav">
                  Analytics
                </a>
                <a href="/quick-certify/integrations" className="unselected-nav">
                  Integrations
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full rounded-sm border border-transparent bg-gray-700 py-1.5 pl-10 pr-3 leading-5 text-gray-300 placeholder-gray-400 focus:border-white focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                  placeholder="Search Events or Participants"
                  type="search"
                />
              </div>
            </div>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-sm p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
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
            </button>
          </div>
          <div className="hidden lg:ml-4 lg:block">
            <div className="flex items-center">
              <button
                type="button"
                className="flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
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
              <div className="relative ml-4 flex-shrink-0">
                <div>
                  <button
                    onClick={() => setMenuOpened(!menuOpened)}
                    type="button"
                    className="flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </button>
                </div>
                {menuOpened && (
                  <div
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex={-1}
                  >
                    <div className="px-4 py-3" role="none">
                      <p className="text-sm" role="none">
                        user@example.com
                      </p>
                      <p className="text-xs text-gray-700" role="none">
                        Organization Name
                      </p>
                    </div>
                    <div className="py-1" role="none">
                      <a
                        href="/settings/profile/general"
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                        role="menuitem"
                        tabIndex={-1}
                      >
                        Profile Settings
                      </a>
                      <a
                        href="/settings/account/general-information"
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                        role="menuitem"
                        tabIndex={-1}
                      >
                        Account Settings
                      </a>
                      <a
                        href="/settings/event/type"
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                        role="menuitem"
                        tabIndex={-1}
                      >
                        Event Settings
                      </a>
                      <a
                        href="/settings/account/team"
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                        role="menuitem"
                        tabIndex={-1}
                      >
                        Team
                      </a>
                    </div>
                    <div className="py-1" role="none">
                      <a href="/login">
                        <button
                          type="submit"
                          className="hover:bg-gray-50 text-gray-700 block w-full px-4 py-2 text-left text-sm"
                          role="menuitem"
                          tabIndex={-1}
                        >
                          Sign out
                        </button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
