/**
 * Event Level Hooks - React Query hooks for event level management
 *
 * All mutations automatically show toast notifications on error via global handler.
 * Success toasts should be handled at the component level.
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { eventService } from '@/services';
import { CreateEventLevelRequest, UpdateEventLevelRequest } from '@/types';

export const EVENT_LEVEL_KEYS = {
  all: ['event-levels'] as const,
  lists: () => [...EVENT_LEVEL_KEYS.all, 'list'] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...EVENT_LEVEL_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...EVENT_LEVEL_KEYS.all, 'detail', id] as const,
};

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
