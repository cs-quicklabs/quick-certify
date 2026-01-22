/**
 * Event Hooks - React Query hooks for event management
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  eventService,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  CreateEventLevelRequest,
  UpdateEventLevelRequest,
  CreateEventFormatRequest,
  UpdateEventFormatRequest,
  CreateEventRequest,
  UpdateEventRequest,
  EventFilters,
} from '@/services';

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
export function useEventTypes(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: EVENT_TYPE_KEYS.list(filters),
    queryFn: () => eventService.getEventTypes(filters),
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
  });
}

export function useUpdateEventType(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventTypeRequest) => eventService.updateEventType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_TYPE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...EVENT_TYPE_KEYS.all, 'infinite'] });
      queryClient.invalidateQueries({ queryKey: EVENT_TYPE_KEYS.detail(id) });
    },
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
  });
}

// Event Level Hooks
export function useEventLevels(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: EVENT_LEVEL_KEYS.list(filters),
    queryFn: () => eventService.getEventLevels(filters),
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
    },
  });
}

export function useUpdateEventLevel(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventLevelRequest) => eventService.updateEventLevel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_LEVEL_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_LEVEL_KEYS.detail(id) });
    },
  });
}

export function useDeleteEventLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEventLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_LEVEL_KEYS.lists() });
    },
  });
}

// Event Format Hooks
export function useEventFormats(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: EVENT_FORMAT_KEYS.list(filters),
    queryFn: () => eventService.getEventFormats(filters),
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
    },
  });
}

export function useUpdateEventFormat(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventFormatRequest) => eventService.updateEventFormat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_FORMAT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_FORMAT_KEYS.detail(id) });
    },
  });
}

export function useDeleteEventFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEventFormat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_FORMAT_KEYS.lists() });
    },
  });
}

// Event Hooks
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: EVENT_KEYS.list(filters),
    queryFn: () => eventService.getEvents(filters),
  });
}

export function useEvent(id: string, enabled = true) {
  return useQuery({
    queryKey: EVENT_KEYS.detail(id),
    queryFn: () => eventService.getEvent(id),
    enabled: enabled && !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventRequest) => eventService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(id) });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
    },
  });
}
