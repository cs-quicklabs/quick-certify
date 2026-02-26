'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import {
  Pagination,
  ModulePermissionError,
  EventsTable,
  MultiSelectFilter,
  FilterItem,
} from '@/components/';
import { toast } from 'react-toastify';
import {
  useEvents,
  useDeleteEvent,
  useEventTypes,
  useEventLevels,
  useEventFormats,
} from '@/hooks/useEvents';
import { getApiErrorMessage } from '@/lib/api-error';

function toggleId(prev: string[], id: string): string[] {
  return prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
}

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);
  const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>([]);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [filterDataLoaded, setFilterDataLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query (300ms)
  useEffect(() => {
    if (query !== debouncedQuery) setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleFilterDataLoad = useCallback(() => {
    if (!filterDataLoaded) setFilterDataLoaded(true);
  }, [filterDataLoaded]);

  // Fetch type/level/format lists (enabled only after first dropdown open)
  const { data: typesData, isLoading: isLoadingTypes } = useEventTypes({
    page: 1,
    limit: 100,
    enabled: filterDataLoaded,
  });
  const { data: levelsData, isLoading: isLoadingLevels } = useEventLevels({
    page: 1,
    limit: 100,
    enabled: filterDataLoaded,
  });
  const { data: formatsData, isLoading: isLoadingFormats } = useEventFormats({
    page: 1,
    limit: 100,
    enabled: filterDataLoaded,
  });

  const typeItems: FilterItem[] = (typesData?.data ?? []).map((t) => ({
    uuid: t.uuid,
    name: t.name,
  }));
  const levelItems: FilterItem[] = (levelsData?.data ?? []).map((l) => ({
    uuid: l.uuid,
    name: l.name,
  }));
  const formatItems: FilterItem[] = (formatsData?.data ?? []).map((f) => ({
    uuid: f.uuid,
    name: f.name,
  }));

  // Fetch events (paginated, server-side filters)
  const { data, isLoading, error } = useEvents({
    page,
    limit,
    search: debouncedQuery || undefined,
    typeIds: selectedTypeIds.length > 0 ? selectedTypeIds.join(',') : undefined,
    levelIds: selectedLevelIds.length > 0 ? selectedLevelIds.join(',') : undefined,
    formatIds: selectedFormatIds.length > 0 ? selectedFormatIds.join(',') : undefined,
  });

  const deleteEventMutation = useDeleteEvent();

  const events = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const pageSafe = Math.min(Math.max(1, page), totalPages);

  // Mark initial load as complete once data is loaded
  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  const hasActiveFilters =
    selectedTypeIds.length > 0 || selectedLevelIds.length > 0 || selectedFormatIds.length > 0;

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setter((prev) => toggleId(prev, id));
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedTypeIds([]);
    setSelectedLevelIds([]);
    setSelectedFormatIds([]);
    setPage(1);
  };
  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setPage(1);
    searchInputRef.current?.focus();
  };

  const handleDeleteEvent = async (uuid: string) => {
    setDeletingEventId(uuid);
    try {
      await deleteEventMutation.mutateAsync(uuid);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
    } finally {
      setDeletingEventId(null);
    }
  };

  const activeFilterTags = [
    ...selectedTypeIds.map((uuid) => ({
      key: `type-${uuid}`,
      label: typeItems.find((t) => t.uuid === uuid)?.name || uuid,
      onRemove: () => toggleFilter(setSelectedTypeIds, uuid),
    })),
    ...selectedLevelIds.map((uuid) => ({
      key: `level-${uuid}`,
      label: levelItems.find((l) => l.uuid === uuid)?.name || uuid,
      onRemove: () => toggleFilter(setSelectedLevelIds, uuid),
    })),
    ...selectedFormatIds.map((uuid) => ({
      key: `format-${uuid}`,
      label: formatItems.find((f) => f.uuid === uuid)?.name || uuid,
      onRemove: () => toggleFilter(setSelectedFormatIds, uuid),
    })),
  ];

  if (getApiErrorMessage(error).includes('Access denied.')) {
    return <ModulePermissionError />;
  }

  // Show loader only on initial load, not when filters/search change
  if (isLoading && isInitialLoad && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-400" size={32} />
        <span className="ml-2 text-gray-500">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="relative bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
      <div className="divide-y dark:divide-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Events Groups</h1>
            <p className="text-sm text-gray-500">
              {total} Events{hasActiveFilters && ' (filtered)'}
            </p>
          </div>
          <Link href="/events/add" className="btn-primary">
            Add new Events
          </Link>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-gray-200">
          <MultiSelectFilter
            label="Type"
            items={typeItems}
            selectedIds={selectedTypeIds}
            onChange={(id) => toggleFilter(setSelectedTypeIds, id)}
            onClear={() => {
              setSelectedTypeIds([]);
              setPage(1);
            }}
            isLoading={isLoadingTypes}
            onOpen={handleFilterDataLoad}
          />
          <MultiSelectFilter
            label="Level"
            items={levelItems}
            selectedIds={selectedLevelIds}
            onChange={(id) => toggleFilter(setSelectedLevelIds, id)}
            onClear={() => {
              setSelectedLevelIds([]);
              setPage(1);
            }}
            isLoading={isLoadingLevels}
            onOpen={handleFilterDataLoad}
          />
          <MultiSelectFilter
            label="Format"
            items={formatItems}
            selectedIds={selectedFormatIds}
            onChange={(id) => toggleFilter(setSelectedFormatIds, id)}
            onClear={() => {
              setSelectedFormatIds([]);
              setPage(1);
            }}
            isLoading={isLoadingFormats}
            onOpen={handleFilterDataLoad}
          />

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilterTags.map((tag) => (
                <span
                  key={tag.key}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-800 border border-blue-200 rounded-full"
                >
                  {tag.label}
                  <button onClick={tag.onRemove} className="hover:text-blue-900 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Search — icon left, spinner or clear button right */}
          <div className="ml-auto relative flex items-center">
            <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events or designs..."
              className="w-64 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-colors"
            />
            {/* Spinner while debounce pending, clear button when there's a value */}
            <div className="absolute right-3">
              {isSearching ? (
                <Loader2 size={14} className="animate-spin text-gray-400" />
              ) : query ? (
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p>{query ? `No results for "${query}"` : 'No events found'}</p>
            {(hasActiveFilters || query) && (
              <button
                onClick={() => {
                  clearFilters();
                  clearSearch();
                }}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Loading overlay for subsequent fetches (not initial load) */}
        {isLoading && data && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        )}

        {/* Events Table */}
        {events.length > 0 && !isLoading && (
          <div className="relative">
            {isLoading && !isInitialLoad && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            )}
            <EventsTable
              events={events}
              onDelete={handleDeleteEvent}
              deletingEventId={deletingEventId}
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end p-4">
        <Pagination
          currentPage={pageSafe}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
