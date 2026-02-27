/**
 * Event Hooks - React Query hooks for event management
 *
 * All mutations automatically show toast notifications on error via global handler.
 * Success toasts should be handled at the component level.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  UseMutationResult,
} from '@tanstack/react-query';
import { eventService, EventServiceError } from '@/services';
import {
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  CreateEventLevelRequest,
  UpdateEventLevelRequest,
  CreateEventFormatRequest,
  UpdateEventFormatRequest,
  CreateEventRequest,
  UpdateEventRequest,
  EventFilters,
  Event,
} from '@/types';

// Event Type Query Keys
export const EVENT_TYPE_KEYS = {
  all: ['event-types'] as const,
  lists: () => [...EVENT_TYPE_KEYS.all, 'list'] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...EVENT_TYPE_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...EVENT_TYPE_KEYS.all, 'detail', id] as const,
};

// Event Level Query Keys
export const EVENT_LEVEL_KEYS = {
  all: ['event-levels'] as const,
  lists: () => [...EVENT_LEVEL_KEYS.all, 'list'] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...EVENT_LEVEL_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...EVENT_LEVEL_KEYS.all, 'detail', id] as const,
};

// Event Format Query Keys
export const EVENT_FORMAT_KEYS = {
  all: ['event-formats'] as const,
  lists: () => [...EVENT_FORMAT_KEYS.all, 'list'] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...EVENT_FORMAT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...EVENT_FORMAT_KEYS.all, 'detail', id] as const,
};

// Event Query Keys
export const EVENT_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENT_KEYS.all, 'list'] as const,
  list: (filters?: EventFilters) => [...EVENT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...EVENT_KEYS.all, 'detail', id] as const,
};

// Event Type Hooks
export function useEventTypes(filters?: { page?: number; limit?: number; enabled?: boolean }) {
  const { enabled = true, ...queryFilters } = filters ?? {};
  return useQuery({
    queryKey: EVENT_TYPE_KEYS.list(queryFilters),
    queryFn: () => eventService.getEventTypes(queryFilters),
    enabled,
  });
}

export function useEventTypesInfinite() {
  return useInfiniteQuery({
    queryKey: [...EVENT_TYPE_KEYS.all, 'infinite'],
    queryFn: ({ pageParam = 1 }) => eventService.getEventTypes({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useEventType(id: string, enabled = true) {
  return useQuery({
    queryKey: EVENT_TYPE_KEYS.detail(id),
    queryFn: () => eventService.getEventType(id),
    enabled: enabled && !!id,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventTypeRequest) => eventService.createEventType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_TYPE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_TYPE_KEYS.all, 'infinite'] });
    },
    // Error is handled by global handler
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateEventTypeRequest) =>
      eventService.updateEventType(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENT_TYPE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_TYPE_KEYS.all, 'infinite'] });
      queryClient.invalidateQueries({ queryKey: EVENT_TYPE_KEYS.detail(variables.id) });
    },
    // Error is handled by global handler
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_TYPE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_TYPE_KEYS.all, 'infinite'] });
    },
    // Error is handled by global handler
  });
}

// Event Level Hooks
export function useEventLevels(filters?: { page?: number; limit?: number; enabled?: boolean }) {
  const { enabled = true, ...queryFilters } = filters ?? {};
  return useQuery({
    queryKey: EVENT_LEVEL_KEYS.list(queryFilters),
    queryFn: () => eventService.getEventLevels(queryFilters),
    enabled,
  });
}

export function useEventLevelsInfinite() {
  return useInfiniteQuery({
    queryKey: [...EVENT_LEVEL_KEYS.all, 'infinite'],
    queryFn: ({ pageParam = 1 }) => eventService.getEventLevels({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useEventLevel(id: string, enabled = true) {
  return useQuery({
    queryKey: EVENT_LEVEL_KEYS.detail(id),
    queryFn: () => eventService.getEventLevel(id),
    enabled: enabled && !!id,
  });
}

export function useCreateEventLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventLevelRequest) => eventService.createEventLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_LEVEL_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_LEVEL_KEYS.all, 'infinite'] });
    },
    // Error is handled by global handler
  });
}

export function useUpdateEventLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateEventLevelRequest) =>
      eventService.updateEventLevel(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENT_LEVEL_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_LEVEL_KEYS.all, 'infinite'] });
      queryClient.invalidateQueries({ queryKey: EVENT_LEVEL_KEYS.detail(variables.id) });
    },
    // Error is handled by global handler
  });
}

export function useDeleteEventLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEventLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_LEVEL_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_LEVEL_KEYS.all, 'infinite'] });
    },
    // Error is handled by global handler
  });
}

// Event Format Hooks
export function useEventFormats(filters?: { page?: number; limit?: number; enabled?: boolean }) {
  const { enabled = true, ...queryFilters } = filters ?? {};
  return useQuery({
    queryKey: EVENT_FORMAT_KEYS.list(queryFilters),
    queryFn: () => eventService.getEventFormats(queryFilters),
    enabled,
  });
}

export function useEventFormatsInfinite() {
  return useInfiniteQuery({
    queryKey: [...EVENT_FORMAT_KEYS.all, 'infinite'],
    queryFn: ({ pageParam = 1 }) => eventService.getEventFormats({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useEventFormat(id: string, enabled = true) {
  return useQuery({
    queryKey: EVENT_FORMAT_KEYS.detail(id),
    queryFn: () => eventService.getEventFormat(id),
    enabled: enabled && !!id,
  });
}

export function useCreateEventFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventFormatRequest) => eventService.createEventFormat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_FORMAT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_FORMAT_KEYS.all, 'infinite'] });
    },
    // Error is handled by global handler
  });
}

export function useUpdateEventFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateEventFormatRequest) =>
      eventService.updateEventFormat(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENT_FORMAT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_FORMAT_KEYS.all, 'infinite'] });
      queryClient.invalidateQueries({ queryKey: EVENT_FORMAT_KEYS.detail(variables.id) });
    },
    // Error is handled by global handler
  });
}

export function useDeleteEventFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEventFormat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_FORMAT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_FORMAT_KEYS.all, 'infinite'] });
    },
    // Error is handled by global handler
  });
}

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
