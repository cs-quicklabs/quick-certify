'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'react-toastify';
import { EventsTable } from '@/components/events/EventsTable';
import { MultiSelectFilter, FilterItem } from '@/components/events/MultiSelectFilter';
import {
  useEvents,
  useDeleteEvent,
  useEventTypes,
  useEventLevels,
  useEventFormats,
} from '@/hooks/useEvents';
import { Event } from '@/services';

function toggleId(prev: string[], id: string): string[] {
  return prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
}

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(4);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);
  const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Lazy-load flag: once any filter dropdown opens, fetch all filter data concurrently
  const [filterDataLoaded, setFilterDataLoaded] = useState(false);

  const handleFilterDataLoad = useCallback(() => {
    if (!filterDataLoaded) setFilterDataLoaded(true);
  }, [filterDataLoaded]);

  // Fetch type/level/format lists concurrently (enabled only after first dropdown open)
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

  // Fetch events from API (paginated, with server-side filters)
  const { data, isLoading, error } = useEvents({
    page,
    limit,
    search: debouncedQuery || undefined,
    typeIds: selectedTypeIds.length > 0 ? selectedTypeIds.join(',') : undefined,
    levelIds: selectedLevelIds.length > 0 ? selectedLevelIds.join(',') : undefined,
    formatIds: selectedFormatIds.length > 0 ? selectedFormatIds.join(',') : undefined,
  });

  // Fetch events for "Filter by Events" dropdown only when opened (lazy load, then cached)
  const [eventFilterLoaded, setEventFilterLoaded] = useState(false);
  const { data: allEventsData } = useEvents({
    page: 1,
    limit: 100,
    enabled: isFilterOpen || eventFilterLoaded,
  });

  useEffect(() => {
    if (isFilterOpen && !eventFilterLoaded) {
      setEventFilterLoaded(true);
    }
  }, [isFilterOpen, eventFilterLoaded]);

  // Delete event mutation
  const deleteEventMutation = useDeleteEvent();

  const events = data?.data ?? [];
  const allEvents = allEventsData?.data ?? [];
  const meta = data?.meta;

  // Handle click outside to close event filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Toggle handler for multi-select filter state
  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setter((prev) => toggleId(prev, id));
    setPage(1);
  };

  // Handle event filter checkbox change
  const handleEventFilterChange = (eventUuid: string) => {
    setSelectedEventIds((prev) => {
      if (prev.includes(eventUuid)) {
        return prev.filter((id) => id !== eventUuid);
      }
      return [...prev, eventUuid];
    });
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedEventIds([]);
    setSelectedTypeIds([]);
    setSelectedLevelIds([]);
    setSelectedFormatIds([]);
    setPage(1);
  };

  // Handle event deletion
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

  // Client-side filter for selected event IDs only (type/level/format are server-side)
  const filteredEvents =
    selectedEventIds.length > 0
      ? events.filter((e: Event) => selectedEventIds.includes(e.uuid))
      : events;

  // Pagination from API meta
  const total = meta?.total ?? filteredEvents.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  const pageSafe = Math.min(Math.max(1, page), totalPages);

  const hasActiveFilters =
    selectedEventIds.length > 0 ||
    selectedTypeIds.length > 0 ||
    selectedLevelIds.length > 0 ||
    selectedFormatIds.length > 0;

  // Build active filter tags for type/level/format
  const activeFilterTags = [
    ...selectedEventIds.map((uuid) => ({
      key: `event-${uuid}`,
      label: allEvents.find((e: Event) => e.uuid === uuid)?.name || uuid,
      onRemove: () => handleEventFilterChange(uuid),
    })),
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

  return (
    <div className="relative bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
      <div className="divide-y dark:divide-gray-700">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Events Groups</h1>
            <p className="text-sm text-gray-500">
              {filteredEvents.length} of {total} Events
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>
          <Link href="/events/add" className="btn-primary">
            Add new Events
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-gray-200">
          {/* Type Filter */}
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

          {/* Level Filter */}
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

          {/* Format Filter */}
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

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilterTags.map((tag) => (
                <span
                  key={tag.key}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-800 border border-blue-200 rounded-full cursor-pointer"
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

          <div className="ml-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by event or design name..."
              className=".form-input-field w-64 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:ring-1 focus:ring-gray-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
            <span className="ml-2 text-gray-500">Loading events...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-red-500">
            <p>Failed to load events</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p>No events found</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Events Table */}
        {!isLoading && !error && filteredEvents.length > 0 && (
          <EventsTable
            events={filteredEvents}
            onDelete={handleDeleteEvent}
            deletingEventId={deletingEventId}
          />
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && (
        <div className="flex justify-end p-4">
          <Pagination
            currentPage={pageSafe}
            totalPages={totalPages}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
