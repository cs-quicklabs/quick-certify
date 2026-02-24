'use client';

import { useParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePublicEvent, usePublicEventParticipants } from '@/hooks/usePublic';
import { PublicBreadcrumb } from '@/app/public/_components/publicBreadcrumb';
import { SearchSortBar, SortOption } from '@/app/public/_components/searchSortBar';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { Recipient } from '@/types';

type SortOrder = 'ASC' | 'DESC';
type SortBy = 'created_at' | 'name';

const SORT_OPTIONS: { label: string; sortBy: SortBy; sortOrder: SortOrder }[] = [
  { label: 'Newest First', sortBy: 'created_at', sortOrder: 'DESC' },
  { label: 'Oldest First', sortBy: 'created_at', sortOrder: 'ASC' },
  { label: 'Name A-Z', sortBy: 'name', sortOrder: 'ASC' },
  { label: 'Name Z-A', sortBy: 'name', sortOrder: 'DESC' },
];

const PAGE_SIZE = 10;

function EventDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-white rounded-sm border border-gray-200 p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="h-64 bg-gray-200 rounded-sm" />
      <div className="flex gap-4">
        <div className="flex-1 bg-white rounded-sm border border-gray-200 p-6 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="w-80 space-y-4">
          <div className="bg-white rounded-sm border border-gray-200 p-6 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticipantsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
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

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const uuid = params?.uuid as string;

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

  const { data: event, isLoading: isLoadingEvent, error: eventError } = usePublicEvent(slug, uuid);

  const { data: participantsData, isLoading: isLoadingParticipants } = usePublicEventParticipants(
    slug,
    uuid,
    { page, limit: PAGE_SIZE, search: debouncedSearch, sortBy, sortOrder },
  );

  const participants = (participantsData?.data ?? []) as Recipient[];
  const meta = participantsData?.meta;

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

  if (isLoadingEvent)
    return (
      <div className="bg-gray-50 min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <EventDetailSkeleton />
        </div>
      </div>
    );

  if (eventError || !event)
    return (
      <div className="bg-gray-50 min-h-screen p-4 flex items-center justify-center">
        <p className="text-red-600">Failed to load event details.</p>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Breadcrumb */}
      <PublicBreadcrumb
        items={[
          { label: 'Issuer Profile', href: `/public/company/${slug}` },
          { label: 'Events', href: `/public/company/${slug}/events` },
          { label: event.name },
        ]}
        title={event.name}
        subtitle={`Created on ${new Date(event.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`}
      />

      {/* Certificate Image */}
      <div className="max-w-7xl mx-auto rounded-sm border border-gray-200 bg-white overflow-hidden mt-4">
        <div className="relative w-full aspect-video">
          <Image
            src={event.design?.url ?? '/credential/image_720.png'}
            alt={event.name}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-4 flex flex-col lg:flex-row gap-4">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Description */}
          {event.description && (
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Learning Resources */}
          {event.learning_link && (
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Resources</h3>
              <a
                href={
                  event.learning_link.startsWith('http')
                    ? event.learning_link
                    : `https://${event.learning_link}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                {event.learning_link}
              </a>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:w-80 flex flex-col gap-4">
          {/* Event Information */}
          <div className="bg-white rounded-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
            <dl className="space-y-4">
              {event.event_type && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Event Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{event.event_type.name}</dd>
                </div>
              )}
              {event.event_level && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Event Level
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{event.event_level.name}</dd>
                </div>
              )}
              {event.event_format && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Event Format
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{event.event_format.name}</dd>
                </div>
              )}
              {/* {event.duration && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Duration
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{event.duration}</dd>
                </div>
              )} */}
            </dl>
          </div>

          {/* Skills */}
          {event.skills && event.skills.length > 0 && (
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {event.skills.map((skill) => (
                  <span
                    key={skill.uuid}
                    className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="max-w-7xl mx-auto p-4 rounded-sm border border-gray-200 bg-white mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
          {meta && <span className="text-sm text-gray-500">{meta.total} participants</span>}
        </div>

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

        {isLoadingParticipants ? (
          <ParticipantsSkeleton />
        ) : participants.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">
              {search ? `No participants found for "${search}"` : 'No participants yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {participants.map((participant) => (
              <Link
                key={participant.uuid}
                href={`/public/company/${slug}/recipients/${participant.uuid}`}
                className="relative flex items-center space-x-3 rounded-sm border border-gray-300 bg-white px-4 py-3 hover:border-gray-400 transition-colors"
              >
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold">
                    {participant.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                  <p className="text-sm text-gray-500 truncate">{participant.email}</p>
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
                isLoading={isLoadingParticipants}
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
