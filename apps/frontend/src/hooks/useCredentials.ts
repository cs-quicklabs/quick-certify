import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  credentialService,
  CreateCredentialRequest,
  UpdateCredentialRequest,
  BatchCreateCredentialRequest,
  PreviewCredentialRequest,
} from '@/services/api/credential.service';
import { BatchStatusEnum, CredentialFilters } from '@/types/credential.types';

export const CREDENTIAL_KEYS = {
  all: ['credentials'] as const,
  lists: () => [...CREDENTIAL_KEYS.all, 'list'] as const,
  list: (filters?: CredentialFilters) => [...CREDENTIAL_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...CREDENTIAL_KEYS.all, 'detail', id] as const,
  publicDetail: (uuid: string) => [...CREDENTIAL_KEYS.all, 'public', uuid] as const,
  batchStatus: (uuid: string) => [...CREDENTIAL_KEYS.all, 'batch', uuid] as const,
};

export function useCredentials(filters?: CredentialFilters & { enabled?: boolean }) {
  const { enabled = true, ...queryFilters } = filters ?? {};
  return useQuery({
    queryKey: CREDENTIAL_KEYS.list(queryFilters),
    queryFn: () => credentialService.getCredentials(queryFilters),
    enabled,
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

export function useCreateBatchCredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BatchCreateCredentialRequest, 'idempotencyKey'>) =>
      credentialService.createBatchCredentials({
        ...data,
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.lists() });
    },
  });
}

/**
 * Poll batch status every 3s while status is PENDING or PROCESSING.
 * Stops polling on terminal status (COMPLETED, PARTIAL_FAILURE, FAILED).
 */
export function useBatchStatus(batchUuid: string | null) {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.batchStatus(batchUuid ?? ''),
    queryFn: () => credentialService.getBatchStatus(batchUuid!),
    enabled: !!batchUuid,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === BatchStatusEnum.PENDING || status === BatchStatusEnum.PROCESSING) {
        return 3000;
      }
      return false;
    },
  });
}

export function usePreviewCertificate() {
  return useMutation({
    mutationFn: (data: PreviewCredentialRequest) => credentialService.generatePreview(data),
  });
}

export function useResendCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => credentialService.resendCredential(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.lists() });
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
