/**
 * Event Type Hooks - React Query hooks for event type management
 *
 * All mutations automatically show toast notifications on error via global handler.
 * Success toasts should be handled at the component level.
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { eventService } from '@/services';
import { CreateEventTypeRequest, UpdateEventTypeRequest } from '@/types';

export const EVENT_TYPE_KEYS = {
  all: ['event-types'] as const,
  lists: () => [...EVENT_TYPE_KEYS.all, 'list'] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...EVENT_TYPE_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...EVENT_TYPE_KEYS.all, 'detail', id] as const,
};

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
