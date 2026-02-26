import { showSuccessToast } from '@/lib/toast';
import { publicService } from '@/services/api/public.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BaseSearchFilters } from '@/lib/query-params';
import { PublicPathwayFilters } from '@/types';

// Query key factory
export const PUBLIC_KEYS = {
  all: ['public'] as const,
  organization: (slug: string) => ['public', 'organization', slug] as const,
  credentials: (slug: string, filters: object) => ['public', 'credentials', slug, filters] as const,
  recipients: (slug: string, filters: object) => ['public', 'recipients', slug, filters] as const,
  event: (slug: string, eventUuid: string) => ['public', 'event', slug, eventUuid] as const,
  pathways: (slug: string, filters: object) => ['public', 'pathways', slug, filters] as const,
  pathway: (slug: string, pathwayUuid: string) => ['public', 'pathway', slug, pathwayUuid] as const,
  pathwayParticipants: (slug: string, pathwayUuid: string, filters: object) =>
    ['public', 'pathway-participants', slug, pathwayUuid, filters] as const,
  pathwayParticipant: (slug: string, pathwayUuid: string, participantUuid: string) =>
    ['public', 'pathway-participant', slug, pathwayUuid, participantUuid] as const,
};

export function usePublicOrganization(slug?: string) {
  return useQuery({
    queryKey: PUBLIC_KEYS.organization(slug ?? ''),
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
    // Removed onError — global MutationCache handles toast on error
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
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    enabled = true,
    search,
    eventId,
    recipientId,
  } = options || {};

  const filters = { page, limit, sortBy, sortOrder, search, eventId, recipientId };

  return useQuery({
    queryKey: PUBLIC_KEYS.credentials(slug, filters), // ← includes all filter params
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');
      return publicService.getPublicCredentials(slug, filters);
    },
    enabled: !!slug && enabled,
    staleTime: 10_000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: undefined,
  });
}

export function usePublicRecipients(
  slug: string,
  filters?: BaseSearchFilters & { enabled?: boolean },
) {
  const { enabled = true, ...queryFilters } = filters ?? {};

  return useQuery({
    queryKey: PUBLIC_KEYS.recipients(slug, queryFilters),
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');
      return await publicService.getRecipientPublic(slug, queryFilters);
    },
    enabled: !!slug && enabled,
    staleTime: 10_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function usePublicEvent(slug?: string, eventUuid?: string) {
  return useQuery({
    queryKey: PUBLIC_KEYS.event(slug ?? '', eventUuid ?? ''),
    queryFn: async () => {
      if (!slug || !eventUuid) throw new Error('Missing slug or eventUuid');
      return publicService.getPublicEvent(slug, eventUuid);
    },
    enabled: !!slug && !!eventUuid,
    staleTime: 10_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function usePublicPathways(
  slug: string,
  filters?: PublicPathwayFilters & { enabled?: boolean },
) {
  const { enabled = true, ...queryFilters } = filters ?? {};

  return useQuery({
    queryKey: PUBLIC_KEYS.pathways(slug, queryFilters),
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');
      return publicService.getPublicPathways(slug, queryFilters);
    },
    enabled: !!slug && enabled,
    staleTime: 10_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function usePublicPathway(slug?: string, pathwayUuid?: string) {
  return useQuery({
    queryKey: PUBLIC_KEYS.pathway(slug ?? '', pathwayUuid ?? ''),
    queryFn: async () => {
      if (!slug || !pathwayUuid) throw new Error('Missing slug or pathwayUuid');
      return publicService.getPublicPathway(slug, pathwayUuid);
    },
    enabled: !!slug && !!pathwayUuid,
    staleTime: 10_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function usePublicPathwayParticipants(
  slug: string,
  pathwayUuid: string,
  filters?: PublicPathwayFilters & { enabled?: boolean },
) {
  const { enabled = true, ...queryFilters } = filters ?? {};

  return useQuery({
    queryKey: PUBLIC_KEYS.pathwayParticipants(slug, pathwayUuid, queryFilters),
    queryFn: async () => {
      if (!slug || !pathwayUuid) throw new Error('Missing slug or pathwayUuid');
      return publicService.getPublicPathwayParticipants(slug, pathwayUuid, queryFilters);
    },
    enabled: !!slug && !!pathwayUuid && enabled,
    staleTime: 10_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function usePublicPathwayParticipant(
  slug?: string,
  pathwayUuid?: string,
  participantUuid?: string,
) {
  return useQuery({
    queryKey: PUBLIC_KEYS.pathwayParticipant(slug ?? '', pathwayUuid ?? '', participantUuid ?? ''),
    queryFn: async () => {
      if (!slug || !pathwayUuid || !participantUuid)
        throw new Error('Missing slug, pathwayUuid, or participantUuid');
      return publicService.getPublicPathwayParticipant(slug, pathwayUuid, participantUuid);
    },
    enabled: !!slug && !!pathwayUuid && !!participantUuid,
    staleTime: 10_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
