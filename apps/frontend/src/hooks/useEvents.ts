/**
 * Event Hooks - React Query hooks for event management
 *
 * All mutations automatically show toast notifications on error via global handler.
 * Success toasts should be handled at the component level.
 *
 * Event Type / Level / Format hooks have been extracted to:
 *   - useEventTypes.ts
 *   - useEventLevels.ts
 *   - useEventFormats.ts
 */

import { useMutation, useQuery, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { eventService, EventServiceError } from '@/services';
import { CreateEventRequest, UpdateEventRequest, EventFilters, Event } from '@/types';

// Event Query Keys
export const EVENT_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENT_KEYS.all, 'list'] as const,
  list: (filters?: EventFilters) => [...EVENT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...EVENT_KEYS.all, 'detail', id] as const,
};

export function useEvents(filters?: EventFilters & { enabled?: boolean }) {
  const { enabled = true, ...queryFilters } = filters ?? {};
  return useQuery({
    queryKey: EVENT_KEYS.list(queryFilters),
    queryFn: () => eventService.getEvents(queryFilters),
    enabled,
    retry: (failureCount, error: unknown) => {
      // Don't retry on 403 (permission denied) or 401 (unauthorized)
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 401) return false;
      return failureCount < 1;
    },
    retryDelay: 0,
  });
}

export function useEvent(id: string, enabled = true) {
  return useQuery({
    queryKey: EVENT_KEYS.detail(id),
    queryFn: () => eventService.getEvent(id),
    enabled: enabled && !!id,
  });
}

export function useEventsPublic(slug: string, filters?: EventFilters & { enabled?: boolean }) {
  const { enabled = true, ...queryFilters } = filters ?? {};
  return useQuery({
    queryKey: EVENT_KEYS.list(queryFilters),
    queryFn: () => eventService.getEventsPublic(slug, queryFilters),
    enabled,
  });
}

/**
 * Hook result type with error type specified
 */
export type CreateEventMutationResult = UseMutationResult<
  Event,
  EventServiceError,
  CreateEventRequest
>;

/**
 * Create a new event
 *
 * Automatically shows toast notification on error via global handler.
 * Component should handle success toast and navigation.
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
    },
    // Error is handled by global handler in query-client.ts
  });
}

/**
 * Update an existing event
 *
 * Automatically shows toast notification on error via global handler.
 * Component should handle success toast and navigation.
 */
export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventRequest) => eventService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(id) });
    },
    // Error is handled by global handler
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
    },
    // Error is handled by global handler
  });
}
