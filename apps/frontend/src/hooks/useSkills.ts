/**
 * Skills Hooks - React Query hooks for skill management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { skillService, CreateSkillRequest, UpdateSkillRequest, SkillFilters } from '@/services';

export const SKILL_KEYS = {
  all: ['skills'] as const,
  lists: () => [...SKILL_KEYS.all, 'list'] as const,
  list: (filters?: SkillFilters) => [...SKILL_KEYS.lists(), { filters }] as const,
  detail: (uuid: string) => [...SKILL_KEYS.all, 'detail', uuid] as const,
};

export function useSkills(filters?: SkillFilters) {
  return useQuery({
    queryKey: SKILL_KEYS.list(filters),
    queryFn: () => skillService.getSkills(filters),
  });
}

export function useSkill(uuid: string, enabled = true) {
  return useQuery({
    queryKey: SKILL_KEYS.detail(uuid),
    queryFn: () => skillService.getSkill(uuid),
    enabled: enabled && !!uuid,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSkillRequest) => skillService.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_KEYS.lists() });
    },
  });
}

export function useUpdateSkill(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSkillRequest) => skillService.updateSkill(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SKILL_KEYS.detail(uuid) });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => skillService.deleteSkill(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_KEYS.lists() });
    },
  });
}
