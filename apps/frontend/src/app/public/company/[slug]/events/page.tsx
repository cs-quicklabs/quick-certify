'use client';

import Link from 'next/link';
import EventCard from '@/app/public/_components/eventCard';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEventsPublic } from '@/hooks/useEvents';
import { useState, useCallback, useEffect } from 'react';
import { Event as EventPublic } from '@/types';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

type SortOrder = 'ASC' | 'DESC';
type SortBy = 'created_at' | 'name';

const SORT_OPTIONS: { label: string; sortBy: SortBy; sortOrder: SortOrder }[] = [
  { label: 'Newest First', sortBy: 'created_at', sortOrder: 'DESC' },
  { label: 'Oldest First', sortBy: 'created_at', sortOrder: 'ASC' },
  { label: 'Name A-Z', sortBy: 'name', sortOrder: 'ASC' },
  { label: 'Name Z-A', sortBy: 'name', sortOrder: 'DESC' },
];

const PAGE_SIZE = 10;

export default function EventPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.sortOrder === sortOrder)?.label ?? 'Sort By';

  // Debounce search input — fires API only 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useEventsPublic(slug, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  // Then type the events array explicitly
  const events = (data?.data ?? []) as unknown as EventPublic[];
  const meta = data?.meta;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleSort = useCallback((option: (typeof SORT_OPTIONS)[number]) => {
    setSortBy(option.sortBy);
    setSortOrder(option.sortOrder);
    setPage(1);
    setShowSortDropdown(false);
  }, []);

  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      {/* Header / Breadcrumb */}
      <div className="max-w-7xl mx-auto p-4 rounded-sm border border-gray-200 bg-white">
        <nav className="sm:hidden" aria-label="Back">
          <Link
            href={`/public/company/${slug}`}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            ← Back
          </Link>
        </nav>

        <nav className="hidden sm:flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                href={`/public/company/${slug}`}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
              >
                Issuer Profile
              </Link>
            </li>
            <li className="text-gray-400">›</li>
            <li>
              <span className="text-sm font-medium text-gray-900">Events</span>
            </li>
          </ol>
        </nav>

        <div className="mt-2">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Events</h2>
        </div>
      </div>

      {/* Search, Sort & Events Grid */}
      <div className="max-w-7xl mx-auto mt-4 p-4 rounded-sm border border-gray-200 bg-white">
        {/* Search & Sort Bar */}
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search event by name"
              value={search}
              onChange={handleSearch}
              className="block w-full pl-9 pr-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortDropdown((prev) => !prev)}
              className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              {activeSortLabel}
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  showSortDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-44 rounded-sm border border-gray-200 bg-white shadow-md">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleSort(option)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      option.sortBy === sortBy && option.sortOrder === sortOrder
                        ? 'text-primary-700 font-medium bg-primary-50'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="mt-4 flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
          </div>
        ) : error ? (
          <div className="mt-4 py-16 text-center">
            <p className="text-sm text-red-600">Failed to load events. Please try again.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="mt-4 py-16 text-center">
            <p className="text-sm text-gray-500">
              {search ? `No events found for "${search}"` : 'No events available yet.'}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.uuid}
                id={event.uuid}
                imageUrl={event.design?.url ?? '/credential/image_720.png'}
                title={event.name}
                createdOn={new Date(event.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                href={`/public/company/${slug}/events/${event.uuid}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="max-w-7xl mx-auto mt-4 bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <PaginationInfo currentPage={meta.page} pageSize={meta.limit} totalCount={meta.total} />
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
              totalCount={meta.total}
              pageSize={meta.limit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
