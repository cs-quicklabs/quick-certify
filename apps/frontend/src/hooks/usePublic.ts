import { publicService } from '@/services/api/public.service';
import { useQuery } from '@tanstack/react-query';

export function usePublicOrganization(slug?: string) {
  return useQuery({
    queryKey: ['public-organization', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');

      const response = await publicService.getPublicOrganization(slug);

      if (!response) {
        throw new Error('Organization not found');
      }

      return response;
    },
    enabled: !!slug,
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus (optional)
  });
}
