'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Loader2 } from 'lucide-react';

export default function PublicEventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [query, setQuery] = useState('');

  const { data, isLoading, isError } = useEvents({ page, limit });

  const events = data?.data || [];
  const meta = data?.meta;

  // Client-side name filter (API currently has no search param)
  const filtered = events.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex flex-col border-b border-gray-200 bg-white antialiased">
        <nav className="order-1 mx-auto w-full max-w-7xl bg-white px-4 py-4 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <Link href="/" className="mr-6 flex">
                <img src="/logo.png" className="mr-3 h-8" alt="Logo" />
                <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                  Quick Certify
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-between lg:order-2">
              <ul className="mr-4 mt-0 hidden w-full flex-col text-base font-medium text-gray-900 md:flex md:flex-row dark:text-white">
                <li>
                  <Link
                    href="/public/company"
                    className="px-4 py-3 hover:underline dark:hover:text-blue-500"
                    aria-current="page"
                  >
                    Issuer Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/events"
                    className="px-4 py-3 hover:underline dark:hover:text-blue-500 font-medium text-blue-600"
                    aria-current="page"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/recipients"
                    className="px-4 py-3 hover:underline dark:hover:text-blue-500"
                    aria-current="page"
                  >
                    Recipients
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero / Search */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="mt-1 text-gray-500">
              Explore upcoming and past events organized by this issuer.
            </p>
          </div>
          <div className="w-full max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events"
              className="block w-full form-input-field"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          )}

          {isError && (
            <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-red-700">
              Failed to load events.
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="rounded-sm border border-gray-200 bg-white p-6 text-gray-600">
              No events found.
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event) => (
                <div key={event.id} className="rounded-sm border border-gray-200 bg-white p-4">
                  <div className="h-40 w-full bg-gray-100 rounded-sm mb-3 flex items-center justify-center text-gray-400">
                    <span className="text-sm">Event banner</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {event.event_type?.name || 'General'} •{' '}
                    {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href={`/public/events/${event.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Event
                    </Link>
                    <button className="text-sm text-gray-500">
                      {event.event_level?.name || ''}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page {meta.page} of {meta.totalPages} • {meta.total} events
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!meta.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-outline px-4 py-2 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
