import { showSuccessToast } from '@/lib/toast';
import { publicService } from '@/services/api/public.service';
import { useMutation, useQuery } from '@tanstack/react-query';

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
    refetchOnWindowFocus: false,
  });
}

export function usePublicSendEmail(slug: string) {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      return await publicService.sendContactEmail(slug, data);
    },
    onSuccess: () => {
      showSuccessToast('Message sent successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to send email:', error);
    },
  });
}

export function usePublicGetRecentIssuedCredentials(
  slug: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    enabled?: boolean;
  },
) {
  const {
    page = 1,
    limit = 3,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    enabled = true,
  } = options || {};

  return useQuery({
    queryKey: ['public-recent-credentials', slug, page, limit, sortBy, sortOrder],
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');

      const response = await publicService.getRecentlyIssuedCredentials(slug, {
        page: 1,
        limit: 3,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      });

      return response;
    },
    enabled: !!slug && enabled,
    staleTime: 30_000, // 30 seconds - credentials update less frequently
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
