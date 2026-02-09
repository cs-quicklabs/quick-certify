'use client';

import Link from 'next/link';
import { useState, useMemo, useRef, useEffect } from 'react';
import { ListFilter, Loader2, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'react-toastify';
import { EventsTable } from '@/components/events/EventsTable';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { Event } from '@/services';

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(4);
  const [query, setQuery] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch events from API (paginated)
  const { data, isLoading, error } = useEvents({
    page,
    limit,
    search: query || undefined,
  });

  // Fetch all events for filter dropdown (no pagination)
  const { data: allEventsData, isLoading: isLoadingAll } = useEvents({
    page: 1,
    limit: 100, // Get more events for filter
  });

  // Delete event mutation
  const deleteEventMutation = useDeleteEvent();

  const events = data?.data ?? [];
  const allEvents = allEventsData?.data ?? [];
  const meta = data?.meta;

  // Handle click outside to close filter dropdown
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

  // Handle filter checkbox change
  const handleFilterChange = (eventUuid: string) => {
    setSelectedEventIds((prev) => {
      if (prev.includes(eventUuid)) {
        return prev.filter((id) => id !== eventUuid);
      }
      return [...prev, eventUuid];
    });
    setPage(1); // Reset to first page when filter changes
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedEventIds([]);
    setPage(1);
  };

  // Handle event deletion
  const handleDeleteEvent = async (uuid: string) => {
    setDeletingEventId(uuid);
    try {
      await deleteEventMutation.mutateAsync(uuid);
      toast.success('Event deleted successfully');
    } catch (error) {
      // Error is handled by global handler, but we can add additional handling here
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
    } finally {
      setDeletingEventId(null);
    }
  };

  // Client-side filter for search and selected events
  const filteredEvents = useMemo(() => {
    let result = events;

    // Filter by search query (event name or design name)
    if (query) {
      const searchTerm = query.toLowerCase();
      result = result.filter(
        (e: Event) =>
          e.name.toLowerCase().includes(searchTerm) ||
          e.design?.name?.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by selected events
    if (selectedEventIds.length > 0) {
      result = result.filter((e: Event) => selectedEventIds.includes(e.uuid));
    }

    return result;
  }, [events, query, selectedEventIds]);

  // Pagination from API meta
  const total = meta?.total ?? filteredEvents.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  const pageSafe = Math.min(Math.max(1, page), totalPages);

  const hasActiveFilters = selectedEventIds.length > 0;

  return (
    <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
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
          {/* Filter by Events Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100"
            >
              <ListFilter size={16} strokeWidth={2} className="mb-0.5" />
              Filter by Events
              {hasActiveFilters && (
                <span className="ml-1 bg-blue-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedEventIds.length}
                </span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500">Select Events</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <X size={12} />
                      Clear
                    </button>
                  )}
                </div>

                {isLoadingAll ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin inline mr-2" />
                    Loading events...
                  </div>
                ) : allEvents.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">No events found</p>
                ) : (
                  <div className="space-y-1">
                    {allEvents.map((event: Event) => (
                      <label
                        key={event.uuid}
                        className="flex items-center gap-2 py-2 px-1 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          checked={selectedEventIds.includes(event.uuid)}
                          onChange={() => handleFilterChange(event.uuid)}
                        />
                        <span className="truncate">{event.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedEventIds.map((uuid) => {
                const event = allEvents.find((e: Event) => e.uuid === uuid);
                return (
                  <span
                    key={uuid}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-800 border border-blue-200 rounded-full cursor-pointer"
                  >
                    {event?.name || uuid}
                    <button
                      onClick={() => handleFilterChange(uuid)}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="ml-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
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
