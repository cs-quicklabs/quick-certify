/**
 * Organization Admin Hooks - React Query hooks for system admin organization management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationAdminService, OrganizationFilters } from '@/services';

export const ORGANIZATION_ADMIN_KEYS = {
  all: ['organizations-admin'] as const,
  lists: () => [...ORGANIZATION_ADMIN_KEYS.all, 'list'] as const,
  list: (filters?: OrganizationFilters) => [...ORGANIZATION_ADMIN_KEYS.lists(), { filters }] as const,
  detail: (uuid: string) => [...ORGANIZATION_ADMIN_KEYS.all, 'detail', uuid] as const,
};

export function useOrganizations(filters?: OrganizationFilters) {
  return useQuery({
    queryKey: ORGANIZATION_ADMIN_KEYS.list(filters),
    queryFn: () => organizationAdminService.getOrganizations(filters),
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => organizationAdminService.permanentlyDeleteOrganization(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_ADMIN_KEYS.lists() });
    },
  });
}
