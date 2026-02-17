'use client';

import { useParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { usePublicRecipients } from '@/hooks/usePublic';
import { PublicBreadcrumb } from '@/app/public/_components/publicBreadcrumb';
import { SearchSortBar } from '@/app/public/_components/searchSortBar';
import { RecipientGrid } from '@/app/public/_components/recipientGrid';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

const SORT_OPTIONS = [
  { label: 'Newest First', sortBy: 'created_at', sortOrder: 'DESC' as const },
  { label: 'Oldest First', sortBy: 'created_at', sortOrder: 'ASC' as const },
  { label: 'Name A-Z', sortBy: 'name', sortOrder: 'ASC' as const },
  { label: 'Name Z-A', sortBy: 'name', sortOrder: 'DESC' as const },
];

const PAGE_SIZE = 12;

export default function PublicRecipientsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
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

  const { data, isLoading, error } = usePublicRecipients(slug, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const recipients = data?.data ?? [];
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
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Breadcrumb */}
      <PublicBreadcrumb
        items={[
          { label: 'Issuer Profile', href: `/public/company/${slug}` },
          { label: 'Recipients' },
        ]}
        title="Recipients"
      />

      {/* Search & Sort */}
      <div className="max-w-7xl mx-auto mt-4 p-4 rounded-sm border border-gray-200 bg-white">
        <SearchSortBar
          search={search}
          onSearchChange={handleSearch}
          searchPlaceholder="Search person by name"
          sortOptions={SORT_OPTIONS}
          activeSortLabel={activeSortLabel}
          showSortDropdown={showSortDropdown}
          onSortToggle={() => setShowSortDropdown((prev) => !prev)}
          onSortSelect={handleSort}
          activeSortBy={sortBy}
          activeSortOrder={sortOrder}
        />
      </div>

      {/* Recipients Grid */}
      <div className="max-w-7xl mx-auto mt-6">
        <RecipientGrid
          recipients={recipients}
          isLoading={isLoading}
          error={error}
          search={search}
          slug={slug}
        />
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="max-w-7xl mx-auto mt-6 bg-white border border-gray-200 rounded-sm p-4">
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
