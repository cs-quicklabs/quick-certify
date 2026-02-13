import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  credentialService,
  CreateCredentialRequest,
  UpdateCredentialRequest,
} from '@/services/api/credential.service';
import { CredentialFilters } from '@/types/credential.types';

export const CREDENTIAL_KEYS = {
  all: ['credentials'] as const,
  lists: () => [...CREDENTIAL_KEYS.all, 'list'] as const,
  list: (filters?: CredentialFilters) => [...CREDENTIAL_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...CREDENTIAL_KEYS.all, 'detail', id] as const,
};

export function useCredentials(filters?: CredentialFilters) {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.list(filters),
    queryFn: () => credentialService.getCredentials(filters),
  });
}

export function useCredential(id: string, enabled = true) {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.detail(id),
    queryFn: () => credentialService.getCredential(id),
    enabled: enabled && !!id,
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCredentialRequest) => credentialService.createCredential(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.lists() });
    },
  });
}

export function useUpdateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateCredentialRequest) =>
      credentialService.updateCredential(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => credentialService.deleteCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.lists() });
    },
  });
}
