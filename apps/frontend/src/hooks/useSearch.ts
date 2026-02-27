import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/api';

export const SEARCH_KEYS = {
  all: ['search'] as const,
  query: (q: string) => [...SEARCH_KEYS.all, q] as const,
};

export function useGlobalSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: SEARCH_KEYS.query(query),
    queryFn: () => searchService.globalSearch(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 30_000,
    gcTime: 60_000,
  });
}
