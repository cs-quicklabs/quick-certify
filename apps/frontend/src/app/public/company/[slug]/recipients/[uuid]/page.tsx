'use client';

import { useParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePublicCredentials } from '@/hooks/usePublic';
import { PublicBreadcrumb } from '@/app/public/_components/publicBreadcrumb';
import { SearchSortBar, SortOption } from '@/app/public/_components/searchSortBar';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { Credential } from '@/types';

type SortOrder = 'ASC' | 'DESC';
type SortBy = 'created_at' | 'name';

const SORT_OPTIONS: { label: string; sortBy: SortBy; sortOrder: SortOrder }[] = [
  { label: 'Newest First', sortBy: 'created_at', sortOrder: 'DESC' },
  { label: 'Oldest First', sortBy: 'created_at', sortOrder: 'ASC' },
  { label: 'Name A-Z', sortBy: 'name', sortOrder: 'ASC' },
  { label: 'Name Z-A', sortBy: 'name', sortOrder: 'DESC' },
];

const PAGE_SIZE = 9;

function CredentialGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-sm animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-sm" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecipientCredentialsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const recipientUuid = params?.uuid as string;

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

  const { data, isLoading, error } = usePublicCredentials(slug, {
    page,
    limit: PAGE_SIZE,
    sortBy,
    sortOrder,
    search: debouncedSearch,
    recipientId: recipientUuid,
  });

  const credentials = (data?.data ?? []) as Credential[];
  const meta = data?.meta;

  // Get recipient name from first credential
  const recipientName = credentials[0]?.recipient?.name ?? 'Recipient';

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.sortOrder === sortOrder)?.label ?? 'Sort By';

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
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Breadcrumb */}
      <PublicBreadcrumb
        items={[
          { label: 'Issuer Profile', href: `/public/company/${slug}` },
          { label: 'Recipients', href: `/public/company/${slug}/recipients` },
        ]}
        title={isLoading ? '...' : recipientName}
      />

      {/* Credentials */}
      <div className="max-w-7xl mx-auto mt-4 p-4 rounded-sm border border-gray-200 bg-white">
        <SearchSortBar
          search={search}
          onSearchChange={handleSearch}
          searchPlaceholder="Search credential by name"
          sortOptions={SORT_OPTIONS}
          activeSortLabel={activeSortLabel}
          showSortDropdown={showSortDropdown}
          onSortToggle={() => setShowSortDropdown((prev) => !prev)}
          onSortSelect={handleSort}
          activeSortBy={sortBy}
          activeSortOrder={sortOrder}
        />

        {isLoading ? (
          <CredentialGridSkeleton />
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">Failed to load credentials. Please try again.</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">
              {search ? `No credentials found for "${search}"` : 'No credentials issued yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {credentials.map((credential) => (
              <Link
                key={credential.uuid}
                href={`/public/company/${slug}/credentials/${credential.uuid}`}
                className="bg-white border border-gray-200 rounded-sm shadow-sm hover:shadow-md transition-shadow"
              >
                <Image
                  src={credential.certificate_url ?? '/credential/image_720.png'}
                  alt={credential.event?.name ?? 'Certificate'}
                  width={400}
                  height={280}
                  className="rounded-t-sm w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="text-lg font-bold tracking-tight text-gray-900">
                      {credential.event?.name ?? 'Certificate'}
                    </h5>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 shrink-0">
                      Event
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {credential.issued_date
                      ? `Issued on ${new Date(credential.issued_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}`
                      : 'Date not available'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <PaginationInfo
                currentPage={meta.page}
                pageSize={meta.limit}
                totalCount={meta.total}
              />
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
    </div>
  );
}
