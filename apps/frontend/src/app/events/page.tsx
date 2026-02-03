'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ListFilter } from 'lucide-react';
import { EventsTable } from '@/components/events/EventsTable';
import { STATIC_EVENTS } from '@/data/static-events';

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [query, setQuery] = useState('');

  // Client-side filtered data using static events (per request)
  const filtered = useMemo(() => {
    return STATIC_EVENTS.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const start = (pageSafe - 1) * limit;
  const end = start + limit;
  const pageItems = filtered.slice(start, end);

  return (
    <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
      <div className="divide-y dark:divide-gray-700">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Events Groups</h1>
            <p className="text-sm text-gray-500">{total} Events</p>
          </div>
          <Link href="/events/add" className="btn-primary">
            Add new Events
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-gray-200">
          <details className="relative">
            <summary className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 list-none">
              <ListFilter size={'16'} strokeWidth={'2'} className='mb-0.5' />
              Filter by Events
            </summary>
            <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Select Events</p>
              <label className="flex items-center gap-2 py-1 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300" /> Events 1
              </label>
              <label className="flex items-center gap-2 py-1 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300" /> Events-2
              </label>
              <label className="flex items-center gap-2 py-1 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300" /> Events-3
              </label>
              <label className="flex items-center gap-2 py-1 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300" /> Events-4
              </label>
            </div>
          </details>

          <div className="ml-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name..."
              className=".form-input-field w-48 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:ring-1 focus:ring-gray-300 focus:outline-none"
            />
          </div>
        </div>

        <EventsTable events={pageItems} />
      </div>

      {/* Pagination */}
      <nav aria-label="Page navigation" className="flex justify-end p-4">
        <ul className="flex -space-x-px text-sm">
          <li>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              className="flex items-center justify-center px-3 h-9 text-sm font-medium bg-neutral-secondary-medium border border-default-medium rounded-s-base hover:bg-neutral-tertiary-medium disabled:opacity-50"
            >
              Previous
            </button>
          </li>

          {Array.from({ length: totalPages }).map((_, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setPage(i + 1)}
                aria-current={pageSafe === i + 1 ? 'page' : undefined}
                className={`flex items-center justify-center w-9 h-9 text-sm border border-default-medium ${pageSafe === i + 1 ? 'font-medium text-fg-brand bg-neutral-tertiary-medium' : ''
                  }`}
              >
                {i + 1}
              </button>
            </li>
          ))}

          <li>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              className="flex items-center justify-center px-3 h-9 text-sm font-medium bg-neutral-secondary-medium border border-default-medium rounded-e-base hover:bg-neutral-tertiary-medium disabled:opacity-50"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
