'use client';

import EventCard from '@/app/public/_components/eventCard';
import { useParams } from 'next/navigation';
import { useEventsPublic } from '@/hooks/useEvents';
import { useState, useCallback, useEffect } from 'react';
import { Event as EventPublic } from '@/types';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { PublicBreadcrumb } from '@/app/public/_components/publicBreadcrumb';
import { SearchSortBar, SortOption } from '@/app/public/_components/searchSortBar';

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

  // Debounce search
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

  const events = (data?.data ?? []) as unknown as EventPublic[];
  const meta = data?.meta;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleSort = useCallback((option: SortOption) => {
    setSortBy(option.sortBy as SortBy); // ← cast here
    setSortOrder(option.sortOrder);
    setPage(1);
    setShowSortDropdown(false);
  }, []);
  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      {/* Breadcrumb */}
      <PublicBreadcrumb
        items={[{ label: 'Issuer Profile', href: `/public/company/${slug}` }, { label: 'Events' }]}
        title="Events"
      />

      {/* Search, Sort & Events Grid */}
      <div className="max-w-7xl mx-auto mt-4 p-4 rounded-sm border border-gray-200 bg-white">
        {/* Search & Sort Bar */}
        <SearchSortBar
          search={search}
          onSearchChange={handleSearch}
          searchPlaceholder="Search event by name"
          sortOptions={SORT_OPTIONS}
          activeSortLabel={activeSortLabel}
          showSortDropdown={showSortDropdown}
          onSortToggle={() => setShowSortDropdown((prev) => !prev)}
          onSortSelect={handleSort}
          activeSortBy={sortBy}
          activeSortOrder={sortOrder}
        />

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
