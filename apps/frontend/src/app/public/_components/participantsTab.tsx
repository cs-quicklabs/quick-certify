'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { SearchSortBar, SortOption } from './searchSortBar';
import { Pagination } from '@/components/ui/pagination';
import { usePublicPathwayParticipants } from '@/hooks/usePublic';
import { createRoute } from '@/config/routes';

type SortOrder = 'ASC' | 'DESC';
type SortBy = 'created_at' | 'name';

const SORT_OPTIONS: { label: string; sortBy: SortBy; sortOrder: SortOrder }[] = [
  { label: 'Newest First', sortBy: 'created_at', sortOrder: 'DESC' },
  { label: 'Oldest First', sortBy: 'created_at', sortOrder: 'ASC' },
  { label: 'Name A-Z', sortBy: 'name', sortOrder: 'ASC' },
  { label: 'Name Z-A', sortBy: 'name', sortOrder: 'DESC' },
];

const PAGE_SIZE = 12;

interface ParticipantsTabProps {
  slug: string;
  pathwayUuid: string;
}

function ParticipantsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-3 rounded-sm border border-gray-300 bg-white px-4 py-3 animate-pulse"
        >
          <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ParticipantsTab({ slug, pathwayUuid }: ParticipantsTabProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.sortOrder === sortOrder)?.label ?? 'Sort By';

  const { data, isLoading } = usePublicPathwayParticipants(slug, pathwayUuid, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
  });

  const participants = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleSort = useCallback((option: SortOption) => {
    setSortBy(option.sortBy as SortBy);
    setSortOrder(option.sortOrder);
    setPage(1);
    setShowSortDropdown(false);
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <SearchSortBar
        search={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search participant by name"
        sortOptions={SORT_OPTIONS}
        activeSortLabel={activeSortLabel}
        showSortDropdown={showSortDropdown}
        onSortToggle={() => setShowSortDropdown((prev) => !prev)}
        onSortSelect={handleSort}
        activeSortBy={sortBy}
        activeSortOrder={sortOrder}
      />

      {isLoading ? (
        <ParticipantsSkeleton />
      ) : participants.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">
            {search ? `No participants found for "${search}"` : 'No participants yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {participants.map((participant) => {
            const name = participant.recipient?.name ?? '';
            const email = participant.recipient?.email ?? '';
            const recipientUuid = participant.recipient?.uuid ?? '';
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link
                key={recipientUuid}
                href={createRoute.publicPathwayParticipant(slug, pathwayUuid, recipientUuid)}
                className="relative flex items-center space-x-3 rounded-sm border border-gray-300 bg-white px-4 py-3 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold">
                    {initials}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                  <p className="text-sm text-gray-500 truncate">{email}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
