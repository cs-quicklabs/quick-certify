/**
 * Team Hooks - React Query hooks for team management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService, CreateTeamMemberRequest, UpdateTeamMemberRequest, TeamFilters } from '@/services';

export const TEAM_KEYS = {
  all: ['team'] as const,
  lists: () => [...TEAM_KEYS.all, 'list'] as const,
  list: (filters?: TeamFilters) => [...TEAM_KEYS.lists(), { filters }] as const,
  detail: (uuid: string) => [...TEAM_KEYS.all, 'detail', uuid] as const,
  roles: () => ['roles'] as const,
};

export function useTeamMembers(filters?: TeamFilters) {
  return useQuery({
    queryKey: TEAM_KEYS.list(filters),
    queryFn: () => teamService.getTeamMembers(filters),
  });
}

export function useTeamMember(uuid: string, enabled = true) {
  return useQuery({
    queryKey: TEAM_KEYS.detail(uuid),
    queryFn: () => teamService.getTeamMember(uuid),
    enabled: enabled && !!uuid,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: TEAM_KEYS.roles(),
    queryFn: () => teamService.getRoles(),
    staleTime: 300000,
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamMemberRequest) => teamService.createTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
    },
  });
}

export function useUpdateTeamMember(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTeamMemberRequest) => teamService.updateTeamMember(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.detail(uuid) });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => teamService.deleteTeamMember(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
    },
  });
}
