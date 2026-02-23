'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePathways } from '@/hooks/usePathways';
import { Pagination } from '@/components/ui/pagination';
import { ROUTES, createRoute } from '@/config/routes';
import { PathwayStatus } from '@/types/pathway.types';

const MAX_VISIBLE_CREDENTIALS = 2;
const ITEMS_PER_PAGE = 10;

const STATUS_FILTERS = [
  { value: PathwayStatus.ACTIVE, label: 'Active', id: 'filter-active' },
  { value: PathwayStatus.DRAFT, label: 'Draft', id: 'filter-draft' },
  { value: PathwayStatus.ARCHIVED, label: 'Archived', id: 'filter-archived' },
];

const STATUS_DOT: Record<PathwayStatus, string> = {
  [PathwayStatus.ACTIVE]: 'bg-green-500',
  [PathwayStatus.DRAFT]: 'bg-yellow-400',
  [PathwayStatus.ARCHIVED]: 'bg-gray-400',
};

const STATUS_LABEL: Record<PathwayStatus, string> = {
  [PathwayStatus.ACTIVE]: 'Active',
  [PathwayStatus.DRAFT]: 'Draft',
  [PathwayStatus.ARCHIVED]: 'Archived',
};

export default function PathwaysPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || PathwayStatus.ACTIVE;
  const isShowAll = currentStatus === 'all';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: pathwaysData, isLoading } = usePathways({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: currentSearch || undefined,
    status: isShowAll ? undefined : currentStatus,
  });

  const pathways = pathwaysData?.data ?? [];
  const meta = pathwaysData?.meta;

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
      router.push(`${ROUTES.PATHWAYS}?${params.toString()}`);
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

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handleStatusFilter = (status: string) => {
    updateParams({ status, page: '1' });
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-3 sm:py-5 min-h-screen">
      <div className="px-4 mx-auto max-w-screen-2xl lg:px-8">
        <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
          <div className="divide-y dark:divide-gray-700">
            {/* Header */}
            <div className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 className="mr-3 form-title">Pathways</h1>
                <p className="form-subtitle">
                  Manage all your existing{' '}
                  <span className="font-bold">{meta?.total ?? 0}</span> pathways or create a new
                  one.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input
                  type="text"
                  placeholder="Search pathways..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full sm:w-2xs px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                />
                <button
                  onClick={() => router.push(`${ROUTES.PATHWAYS}/add`)}
                  className="btn-primary whitespace-nowrap text-center"
                >
                  Create Pathway
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center pt-1 pb-4 border-t border-b border-gray-200 dark:border-gray-200 px-4 gap-x-4 gap-y-3">
            <div className="items-center hidden mt-3 mr-0 text-sm font-medium text-gray-900 md:flex dark:text-white">
              Show records only for:
            </div>
            <div className="flex flex-wrap flex-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleStatusFilter(filter.value)}
                  className="flex items-center mt-3 mr-4 cursor-pointer"
                >
                  <input
                    id={filter.id}
                    type="radio"
                    name="show-only"
                    checked={!isShowAll && currentStatus === filter.value}
                    onChange={() => handleStatusFilter(filter.value)}
                    className="w-4 h-4 bg-gray-100 border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                  <label
                    htmlFor={filter.id}
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                  >
                    {filter.label}
                  </label>
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleStatusFilter('all')}
                className={`mt-3 mr-4 font-medium text-sm cursor-pointer ${
                  isShowAll
                    ? 'text-primary-700 underline'
                    : 'text-blue-600 dark:text-blue-500 hover:underline'
                }`}
              >
                Show All
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Credentials
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Participants
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Duration
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      </div>
                    </td>
                  </tr>
                ) : pathways.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      No pathways found
                    </td>
                  </tr>
                ) : (
                  pathways.map((pathway) => (
                    <tr
                      key={pathway.uuid}
                      onClick={() => router.push(createRoute.pathwayDetail(pathway.uuid))}
                      className="border-b border-gray-200 dark:border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <th scope="row" className="px-4 py-2 form-text-normal">
                        <div className="flex items-center">
                          <span className="hover:underline font-semibold text-gray-900">
                            {pathway.name}
                          </span>
                        </div>
                      </th>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {pathway.events
                            .slice(0, MAX_VISIBLE_CREDENTIALS)
                            .map((credential) => (
                              <span
                                key={credential.uuid}
                                className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                              >
                                {credential.name}
                              </span>
                            ))}
                          {pathway.events.length > MAX_VISIBLE_CREDENTIALS && (
                            <span
                              className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 cursor-default"
                              title={pathway.events
                                .slice(MAX_VISIBLE_CREDENTIALS)
                                .map((c) => c.name)
                                .join(', ')}
                            >
                              +{pathway.events.length - MAX_VISIBLE_CREDENTIALS}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 form-text-normal">
                        {pathway.participants?.length || '-'}
                      </td>
                      <td className="px-4 py-2 form-text-normal">{pathway.duration || '-'}</td>
                      <td className="px-4 py-2 form-text-normal">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 mr-2 ${STATUS_DOT[pathway.status]} rounded-full`}
                          />
                          {STATUS_LABEL[pathway.status]}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : pathways.length === 0 ? (
              <p className="text-center py-12 text-gray-500 text-sm">No pathways found</p>
            ) : (
              pathways.map((pathway) => (
                <button
                  key={pathway.uuid}
                  type="button"
                  onClick={() => router.push(createRoute.pathwayDetail(pathway.uuid))}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {pathway.name}
                    </span>
                    <div className="flex items-center text-xs">
                      <div
                        className={`w-2 h-2 mr-1.5 ${STATUS_DOT[pathway.status]} rounded-full`}
                      />
                      <span className="text-gray-500">{STATUS_LABEL[pathway.status]}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {pathway.events
                      .slice(0, MAX_VISIBLE_CREDENTIALS)
                      .map((credential) => (
                        <span
                          key={credential.uuid}
                          className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                        >
                          {credential.name}
                        </span>
                      ))}
                    {pathway.events.length > MAX_VISIBLE_CREDENTIALS && (
                      <span className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        +{pathway.events.length - MAX_VISIBLE_CREDENTIALS}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{pathway.participants?.length ?? 0} participants</span>
                    <span>{pathway.duration || '- Durations'}</span>
                  </div>
                </button>
              ))
            )}
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
      </div>
    </section>
  );
}
