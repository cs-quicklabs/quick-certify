import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  pathwayService,
  CreatePathwayRequest,
  UpdatePathwayRequest,
  AddParticipantRequest,
} from '@/services';
import { PathwayFilters } from '@/types';

export const PATHWAY_KEYS = {
  all: ['pathways'] as const,
  lists: () => [...PATHWAY_KEYS.all, 'list'] as const,
  list: (filters?: PathwayFilters) => [...PATHWAY_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...PATHWAY_KEYS.all, 'detail', id] as const,
  participants: (id: string) => [...PATHWAY_KEYS.all, 'participants', id] as const,
  participantList: (id: string, filters?: Record<string, unknown>) =>
    [...PATHWAY_KEYS.participants(id), { filters }] as const,
};

export function usePathways(filters?: PathwayFilters & { enabled?: boolean }) {
  const { enabled = true, ...queryFilters } = filters ?? {};
  return useQuery({
    queryKey: PATHWAY_KEYS.list(queryFilters),
    queryFn: () => pathwayService.getPathways(queryFilters),
    enabled,
  });
}

export function usePathway(id: string, enabled = true) {
  return useQuery({
    queryKey: PATHWAY_KEYS.detail(id),
    queryFn: () => pathwayService.getPathway(id),
    enabled: enabled && !!id,
  });
}

export function useCreatePathway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePathwayRequest) => pathwayService.createPathway(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATHWAY_KEYS.lists() });
    },
  });
}

export function useUpdatePathway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdatePathwayRequest) =>
      pathwayService.updatePathway(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PATHWAY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PATHWAY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeletePathway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pathwayService.deletePathway(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATHWAY_KEYS.lists() });
    },
  });
}

export function usePathwayParticipants(
  pathwayUuid: string,
  filters?: { page?: number; limit?: number; search?: string },
) {
  return useQuery({
    queryKey: PATHWAY_KEYS.participantList(pathwayUuid, filters),
    queryFn: () => pathwayService.getParticipants(pathwayUuid, filters),
    enabled: !!pathwayUuid,
  });
}

export function useAddParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pathwayUuid, ...data }: { pathwayUuid: string } & AddParticipantRequest) =>
      pathwayService.addParticipant(pathwayUuid, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PATHWAY_KEYS.participants(variables.pathwayUuid) });
      queryClient.invalidateQueries({ queryKey: PATHWAY_KEYS.detail(variables.pathwayUuid) });
    },
  });
}
