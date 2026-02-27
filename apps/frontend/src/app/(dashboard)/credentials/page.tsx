'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCredentials } from '@/hooks/useCredentials';
import { useEvents } from '@/hooks/useEvents';
import { Pagination, ModulePermissionError } from '@/components';
import { ROUTES, createRoute } from '@/config/routes';
import { CredentialStatus } from '@/types/credential.types';
import { ListFilter } from 'lucide-react';

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
  const debouncedInput = useDebounce(searchInput);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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

  if (error?.message.includes('403')) {
    return <ModulePermissionError />;
  }

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
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
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
          {/* Event Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="cursor-pointer flex items-center text-black gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <ListFilter className="w-4 h-4 stroke-2 text-gray-500 " />
              <span className="text-gray-700 dark:text-gray-300">
                {selectedEvent ? selectedEvent.name : 'Filter by Events'}
              </span>
            </button>

            {isFilterOpen && (
              <div className="absolute z-10 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Select Events
                </p>
                <button
                  onClick={() => handleEventFilter('')}
                  className={`w-full text-left py-1.5 px-1 text-sm rounded hover:text-blue-600 cursor-pointer ${
                    !currentEventId
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All Events
                </button>
                {events.map((event) => (
                  <button
                    key={event.uuid}
                    onClick={() => handleEventFilter(event.uuid)}
                    className={`w-full text-left py-1.5 px-1 text-sm rounded hover:text-blue-600 cursor-pointer capitalize ${
                      currentEventId === event.uuid
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
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

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-left font-black text-gray-600 bg-gray-50 border-b border-gray-200">
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
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-2  text-gray-900 dark:text-white">
                      {item.recipient?.name}
                    </td>
                    <td className="px-6 py-2 text-gray-500">{item.recipient?.email}</td>
                    <td className="px-6 py-2">
                      {item.event ? (
                        <button
                          onClick={() => router.push(createRoute.eventDetail(item.event!.uuid))}
                          className="text-gray-900 dark:text-white  hover:text-blue-600 hover:underline cursor-pointer"
                        >
                          {item.event.name}
                        </button>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-2 text-gray-900 dark:text-white">
                      {formatDate(item.issued_date)}
                    </td>
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
                        className="text-blue-600 hover:underline font-medium"
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
                className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-1.5">
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
                    className="ml-auto text-blue-600 hover:underline font-medium"
                  >
                    View
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
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
