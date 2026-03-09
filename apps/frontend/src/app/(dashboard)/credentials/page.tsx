'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCredentials } from '@/hooks/useCredentials';
import { useEvents } from '@/hooks/useEvents';
import { Pagination, ModulePermissionError } from '@/components';
import { ROUTES } from '@/config/routes';
import { ListFilter } from 'lucide-react';
import { CredentialTable } from '@/components/credentials/CredentialTable';
import { CredentialCards } from '@/components/credentials/CredentialCards';

const ITEMS_PER_PAGE = 10;

export default function CredentialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';
  const currentEventId = searchParams.get('eventId') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedInput = useDebounce(searchInput);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useClickOutside<HTMLDivElement>(() => setIsFilterOpen(false));

  const {
    data: credentialsData,
    isLoading,
    error,
  } = useCredentials({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: currentSearch || undefined,
    eventId: currentEventId || undefined,
  });

  const { data: eventsData } = useEvents({ limit: 100 });

  const credentials = credentialsData?.data ?? [];
  const meta = credentialsData?.meta;
  const events = eventsData?.data ?? [];
  const selectedEvent = events.find((e) => e.uuid === currentEventId);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`${ROUTES.CREDENTIALS}?${params.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (debouncedInput !== currentSearch) {
      updateParams({ search: debouncedInput, page: '' });
    }
  }, [debouncedInput, currentSearch, updateParams]);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handleEventFilter = (eventId: string) => {
    updateParams({ eventId, page: '' });
    setIsFilterOpen(false);
  };

  if (error?.message.includes('403')) {
    return <ModulePermissionError />;
  }

  return (
    <div>
      <div className="bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between min-w-34 px-4 py-2 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Credential</h1>
            <p className="text-sm text-gray-500">
              {meta?.total ?? 0} credential{(meta?.total ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => router.push(`${ROUTES.CREDENTIALS_ISSUE}`)}
            className="btn-primary"
          >
            Issue Credential
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
          {/* Event Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="cursor-pointer flex items-center text-black gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100"
            >
              <ListFilter className="w-4 h-4 stroke-2 text-gray-500 " />
              <span className="text-gray-700">
                {selectedEvent ? selectedEvent.name : 'Filter by Events'}
              </span>
            </button>

            {isFilterOpen && (
              <div className="absolute z-10 mt-1 w-52 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Select Events
                </p>
                <button
                  onClick={() => handleEventFilter('')}
                  className={`w-full text-left py-1.5 px-1 text-sm rounded hover:text-blue-600 cursor-pointer ${
                    !currentEventId ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  All Events
                </button>
                {events.map((event) => (
                  <button
                    key={event.uuid}
                    onClick={() => handleEventFilter(event.uuid)}
                    className={`w-full text-left py-1.5 px-1 text-sm rounded hover:text-blue-600 cursor-pointer capitalize ${
                      currentEventId === event.uuid ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {event.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search — pushed to the right */}
          <div className="ml-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-48 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:ring-1 focus:ring-gray-300 focus:outline-none"
            />
          </div>
        </div>

        <CredentialTable credentials={credentials} isLoading={isLoading} />
        <CredentialCards credentials={credentials} isLoading={isLoading} />
      </div>
      {/* Pagination  */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-end mt-6 px-4">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
