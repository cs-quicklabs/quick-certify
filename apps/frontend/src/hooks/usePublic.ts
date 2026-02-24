import { showSuccessToast } from '@/lib/toast';
import { publicService } from '@/services/api/public.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BaseSearchFilters } from '@/lib/query-params';

export function usePublicOrganization(slug?: string) {
  return useQuery({
    queryKey: ['public-organization', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');
      const response = await publicService.getPublicOrganization(slug);
      if (!response) throw new Error('Organization not found');
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

export function usePublicCredentials(
  slug: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    enabled?: boolean;
    search?: string;
    eventId?: string;
    recipientId?: string;
  },
) {
  const {
    page,
    limit,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    enabled = true,
    search,
    eventId,
    recipientId,
  } = options || {};

  return useQuery({
    queryKey: ['public-recent-credentials', slug, page, limit, sortBy, sortOrder, search],
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');
      const response = await publicService.getPublicCredentials(slug, {
        page: 1,
        limit: 3,
        sortBy: 'created_at',
        sortOrder: 'DESC',
        search,
        eventId,
        recipientId,
      });
      return response;
    },
    enabled: !!slug && enabled,
    staleTime: 30_000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: undefined, // doesn't show placeholder data from past queries
  });
}

export function usePublicRecipients(
  slug: string,
  filters?: BaseSearchFilters & { enabled?: boolean },
) {
  const { enabled = true, eventUuid, ...queryFilters } = filters ?? {};

  return useQuery({
    queryKey: ['public-recipients', slug, queryFilters],
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');
      return await publicService.getRecipientPublic(slug, queryFilters);
    },
    enabled: !!slug && enabled,
    staleTime: 30_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function usePublicEvent(slug?: string, eventUuid?: string) {
  return useQuery({
    queryKey: ['public-event', slug, eventUuid],
    queryFn: async () => {
      if (!slug || !eventUuid) throw new Error('Missing slug or eventUuid');
      return publicService.getPublicEvent(slug, eventUuid);
    },
    enabled: !!slug && !!eventUuid,
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
