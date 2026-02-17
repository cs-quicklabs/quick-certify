'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCredentials } from '@/hooks/useCredentials';
import { useEvents } from '@/hooks/useEvents';
import { Pagination } from '@/components/ui/pagination';
import { ROUTES, createRoute } from '@/config/routes';
import { CredentialStatus } from '@/types/credential.types';

const STATUS_CONFIG: Record<
  CredentialStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  [CredentialStatus.ISSUED]: {
    label: 'Issued',
    dotColor: 'bg-green-500',
    textColor: 'text-green-700',
  },
  [CredentialStatus.PENDING]: {
    label: 'Pending',
    dotColor: 'bg-yellow-400',
    textColor: 'text-yellow-700',
  },
  [CredentialStatus.PROCESSING]: {
    label: 'Processing',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-700',
  },
  [CredentialStatus.FAILED]: { label: 'Failed', dotColor: 'bg-red-500', textColor: 'text-red-700' },
  [CredentialStatus.DRAFT]: { label: 'Draft', dotColor: 'bg-gray-400', textColor: 'text-gray-500' },
};

function CredentialStatusBadge({ status }: { status: CredentialStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${config.textColor}`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

const ITEMS_PER_PAGE = 10;

export default function CredentialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';
  const currentEventId = searchParams.get('eventId') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: credentialsData, isLoading } = useCredentials({
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateParams({ search: searchInput, page: '' });
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, currentSearch, updateParams]);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handleEventFilter = (eventId: string) => {
    updateParams({ eventId, page: '' });
    setIsFilterOpen(false);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="relative bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <div>
            <h1 className="form-title">Credential</h1>
            <p className="form-subtitle">
              Manage all your {meta?.total ?? 0} credential{(meta?.total ?? 0) > 1 ? 's' : ''} or
              add a new one.
            </p>
          </div>
          <button
            onClick={() => router.push(`${ROUTES.CREDENTIALS}/issue`)}
            className="btn-primary"
          >
            Issue Credential
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-2">
          {/* Event Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 capitalize"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h18M6 10h12M10 16h4"
                />
              </svg>
              {selectedEvent ? selectedEvent.name : 'Filter by Events'}
            </button>

            {isFilterOpen && (
              <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Select Events</p>
                <button
                  onClick={() => handleEventFilter('')}
                  className={`w-full text-left py-1 text-sm hover:text-blue-600 cursor-pointer ${
                    !currentEventId ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  All Events
                </button>
                {events.map((event) => (
                  <button
                    key={event.uuid}
                    onClick={() => handleEventFilter(event.uuid)}
                    className={`w-full text-left py-1 text-sm hover:text-blue-600 cursor-pointer capitalize ${
                      currentEventId === event.uuid ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {event.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="ml-auto">
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-3xs px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:ring-1 focus:ring-gray-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Events
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Issue Date
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    </div>
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No credentials found
                  </td>
                </tr>
              ) : (
                credentials.map((item) => (
                  <tr
                    key={item.uuid}
                    className="border-b border-gray-200 dark:border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-2 form-text-normal font-medium text-gray-900">
                      {item.recipient?.name}
                    </td>
                    <td className="px-6 py-2 text-gray-500">{item.recipient?.email}</td>
                    <td className="px-6 py-2">
                      {item.event ? (
                        <button
                          onClick={() => router.push(createRoute.eventDetail(item.event!.uuid))}
                          className="text-gray-900 font-medium hover:text-blue-600 hover:underline cursor-pointer"
                        >
                          {item.event.name}
                        </button>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-2 text-gray-900">{formatDate(item.issued_date)}</td>
                    <td className="px-6 py-2">
                      <CredentialStatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-2">
                      <a
                        href={createRoute.credentialDetail(item.uuid)}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(createRoute.credentialDetail(item.uuid));
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : credentials.length === 0 ? (
            <p className="text-center py-12 text-gray-500 text-sm">No credentials found</p>
          ) : (
            credentials.map((item) => (
              <div
                key={item.uuid}
                className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {item.recipient?.name}
                  </span>
                  <CredentialStatusBadge status={item.status} />
                </div>
                <p className="text-xs text-gray-500 mb-2">{item.recipient?.email}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    {item.event ? (
                      <button
                        onClick={() => router.push(createRoute.eventDetail(item.event!.uuid))}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {item.event.name}
                      </button>
                    ) : (
                      '--'
                    )}
                  </span>
                  <span>{formatDate(item.issued_date)}</span>
                  <a
                    href={createRoute.publicCredential(item.uuid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
