'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { usePathways } from '@/hooks/usePathways';
import { Pagination } from '@/components/ui/pagination';
import { PathwaysTable } from '@/components/pathways/PathwaysTable';
import { ROUTES } from '@/config/routes';
import { PathwayStatus } from '@/types/pathway.types';

const ITEMS_PER_PAGE = 10;

const STATUS_FILTERS = [
  { value: PathwayStatus.ACTIVE, label: 'Active', id: 'filter-active' },
  { value: PathwayStatus.DRAFT, label: 'Draft', id: 'filter-draft' },
  { value: PathwayStatus.ARCHIVED, label: 'Archived', id: 'filter-archived' },
];

function PathwaysContent() {
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

  // Sync input when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput((prev) => (prev !== currentSearch ? currentSearch : prev));
  }, [currentSearch]);

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handleStatusFilter = (status: string) => {
    updateParams({ status, page: '1' });
  };

  return (
    <div className="relative bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Header */}
        <div className="px-4 py-2 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="mr-3 form-title">Pathways</h1>
            <p className="form-subtitle">
              Manage all your existing <span className="font-bold">{meta?.total ?? 0}</span>{' '}
              pathways or create a new one.
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
              onClick={() => router.push(ROUTES.PATHWAYS_ADD)}
              className="btn-primary whitespace-nowrap text-center"
            >
              Create Pathway
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center pt-1 pb-4 px-4 gap-x-4 gap-y-3">
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

        <PathwaysTable pathways={pathways} isLoading={isLoading} />
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

export default function PathwaysPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      }
    >
      <PathwaysContent />
    </Suspense>
  );
}
