/**
 * Event Format Hooks - React Query hooks for event format management
 *
 * All mutations automatically show toast notifications on error via global handler.
 * Success toasts should be handled at the component level.
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { eventService } from '@/services';
import { CreateEventFormatRequest, UpdateEventFormatRequest } from '@/types';

export const EVENT_FORMAT_KEYS = {
  all: ['event-formats'] as const,
  lists: () => [...EVENT_FORMAT_KEYS.all, 'list'] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...EVENT_FORMAT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...EVENT_FORMAT_KEYS.all, 'detail', id] as const,
};

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
