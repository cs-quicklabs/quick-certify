'use client';

import { useParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { PublicBreadcrumb } from '@/app/public/_components/publicBreadcrumb';
import { SearchSortBar, SortOption } from '@/app/public/_components/searchSortBar';
import { PathwayCard } from '@/app/public/_components/pathwayCard';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { usePublicPathways } from '@/hooks/usePublic';
import { PublicPathway } from '@/types';
import { ROUTES, createRoute } from '@/config/routes';

type SortOrder = 'ASC' | 'DESC';
type SortBy = 'created_at' | 'name';

const SORT_OPTIONS: { label: string; sortBy: SortBy; sortOrder: SortOrder }[] = [
  { label: 'Newest First', sortBy: 'created_at', sortOrder: 'DESC' },
  { label: 'Oldest First', sortBy: 'created_at', sortOrder: 'ASC' },
  { label: 'Name A-Z', sortBy: 'name', sortOrder: 'ASC' },
  { label: 'Name Z-A', sortBy: 'name', sortOrder: 'DESC' },
];

const PAGE_SIZE = 9;

function PathwayGridSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm border border-gray-200 bg-white overflow-hidden animate-pulse"
        >
          <div className="h-40 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PublicPathwaysPage() {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = usePublicPathways(slug, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const pathways = (data?.data ?? []) as PublicPathway[];
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
    <div className="bg-gray-50 p-4 min-h-screen">
      <PublicBreadcrumb
        items={[{ label: 'Issuer Profile', href: `${ROUTES.PUBLIC.COMPANY}/${slug}` }, { label: 'Pathways' }]}
        title="Pathways"
      />

      <div className="max-w-7xl mx-auto mt-4 pt-4 pb-8 px-8 rounded-sm border border-gray-200 bg-white">
        <SearchSortBar
          search={search}
          onSearchChange={handleSearch}
          searchPlaceholder="Search pathways..."
          sortOptions={SORT_OPTIONS}
          activeSortLabel={activeSortLabel}
          showSortDropdown={showSortDropdown}
          onSortToggle={() => setShowSortDropdown((prev) => !prev)}
          onSortSelect={handleSort}
          activeSortBy={sortBy}
          activeSortOrder={sortOrder}
        />

        {isLoading ? (
          <PathwayGridSkeleton />
        ) : error ? (
          <div className="mt-4 py-20 text-center">
            <p className="text-sm text-red-600">Failed to load pathways. Please try again.</p>
          </div>
        ) : pathways.length === 0 ? (
          <div className="mt-4 py-16 text-center">
            <p className="text-sm text-gray-500">
              {search ? `No pathways found for "${search}"` : 'No pathways available yet.'}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pathways.map((pathway) => (
              <PathwayCard
                key={pathway.uuid}
                name={pathway.name}
                imageUrl={pathway.banner_url ?? '/credential/image_720.png'}
                credentialCount={pathway.credential_count}
                participantCount={pathway.participant_count}
                duration={pathway.duration}
                href={createRoute.publicPathwayDetail(slug, pathway.uuid)}
              />
            ))}
          </div>
        )}
      </div>

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
