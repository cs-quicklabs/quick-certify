'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2, Search, X } from 'lucide-react';
import {
  Pagination,
  ModulePermissionError,
  EventsTable,
  MultiSelectFilter,
  FilterItem,
} from '@/components/';
import { showSuccessToast } from '@/lib/toast';
import { ROUTES } from '@/config/routes';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { useEventTypes } from '@/hooks/useEventTypes';
import { useEventLevels } from '@/hooks/useEventLevels';
import { useEventFormats } from '@/hooks/useEventFormats';
import { getApiErrorMessage } from '@/lib/api-error';
import { useMultiSelectFilters } from '@/hooks/useMultiSelectFilters';
import { FilterTagList } from '@/components/events/FilterTagList';
import { useUser } from '@/store/auth.store';
import { checkIfUserIsNonAdmin } from '@/utils/helpers';

export default function EventsPage() {
  const user = useUser();
  const canDelete = !checkIfUserIsNonAdmin(user!);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);
  const isSearching = query !== debouncedQuery;

  const {
    selected,
    toggle,
    clear,
    hasActive: hasActiveFilters,
  } = useMultiSelectFilters(['type', 'level', 'format']);
  const selectedTypeIds = selected.type ?? [];
  const selectedLevelIds = selected.level ?? [];
  const selectedFormatIds = selected.format ?? [];
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [filterDataLoaded, setFilterDataLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

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

  function mapDataToFilterItems<T extends { uuid: string; name: string }>(
    data: T[] | undefined,
  ): FilterItem[] {
    return (data ?? []).map((item) => ({
      uuid: item.uuid,
      name: item.name,
    }));
  }

  const typeItems: FilterItem[] = mapDataToFilterItems(typesData?.data);
  const levelItems: FilterItem[] = mapDataToFilterItems(levelsData?.data);
  const formatItems: FilterItem[] = mapDataToFilterItems(formatsData?.data);

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

  const toggleFilter = (key: string, id: string) => {
    toggle(key, id);
    setPage(1);
  };

  const clearFilters = () => {
    clear();
    setPage(1);
  };
  const clearSearch = () => {
    setQuery('');
    setPage(1);
    searchInputRef.current?.focus();
  };

  const handleDeleteEvent = async (uuid: string) => {
    setDeletingEventId(uuid);
    try {
      await deleteEventMutation.mutateAsync(uuid);
      showSuccessToast('Event deleted successfully');
    } finally {
      setDeletingEventId(null);
    }
  };

  const activeFilterTags = [
    ...selectedTypeIds.map((uuid) => ({
      key: `type-${uuid}`,
      label: typeItems.find((t) => t.uuid === uuid)?.name || uuid,
      onRemove: () => toggleFilter('type', uuid),
    })),
    ...selectedLevelIds.map((uuid) => ({
      key: `level-${uuid}`,
      label: levelItems.find((l) => l.uuid === uuid)?.name || uuid,
      onRemove: () => toggleFilter('level', uuid),
    })),
    ...selectedFormatIds.map((uuid) => ({
      key: `format-${uuid}`,
      label: formatItems.find((f) => f.uuid === uuid)?.name || uuid,
      onRemove: () => toggleFilter('format', uuid),
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
    <div>
      <div className="divide-y relative bg-white shadow-md sm:rounded-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Events Groups</h1>
            <p className="text-sm text-gray-500">
              {total} Events{hasActiveFilters && ' (filtered)'}
            </p>
          </div>
          <Link href={ROUTES.CREATE_EVENT} className="btn-primary">
            Add new Events
          </Link>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-gray-200">
          <MultiSelectFilter
            label="Type"
            items={typeItems}
            selectedIds={selectedTypeIds}
            onChange={(id) => toggleFilter('type', id)}
            onClear={() => {
              clear('type');
              setPage(1);
            }}
            isLoading={isLoadingTypes}
            onOpen={handleFilterDataLoad}
          />
          <MultiSelectFilter
            label="Level"
            items={levelItems}
            selectedIds={selectedLevelIds}
            onChange={(id) => toggleFilter('level', id)}
            onClear={() => {
              clear('level');
              setPage(1);
            }}
            isLoading={isLoadingLevels}
            onOpen={handleFilterDataLoad}
          />
          <MultiSelectFilter
            label="Format"
            items={formatItems}
            selectedIds={selectedFormatIds}
            onChange={(id) => toggleFilter('format', id)}
            onClear={() => {
              clear('format');
              setPage(1);
            }}
            isLoading={isLoadingFormats}
            onOpen={handleFilterDataLoad}
          />

          <FilterTagList tags={activeFilterTags} onClearAll={clearFilters} />

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
              {(() => {
                if (isSearching)
                  return <Loader2 size={14} className="animate-spin text-gray-400" />;
                if (query)
                  return (
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  );
                return null;
              })()}
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
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            )}
            <EventsTable
              events={events}
              onDelete={handleDeleteEvent}
              canDelete={canDelete}
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
