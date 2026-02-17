import { PaginatedResponse } from '@/types';
import {
  Credential,
  CredentialStatus,
  CredentialFilters,
  BatchResult,
  BatchStatus,
  PublicCredential,
} from '@/types/credential.types';
import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';

export interface CreateCredentialRequest {
  recipientName: string;
  recipientEmail: string;
  eventId: string;
  issuedDate?: string;
  expirationDate?: string;
  certificateUrl?: string;
  status?: CredentialStatus.DRAFT | CredentialStatus.ISSUED;
}

export interface BatchCreateCredentialRequest {
  eventId: string;
  idempotencyKey: string;
  recipients: { name: string; email: string }[];
  issuedDate?: string;
  expirationDate?: string;
}

export interface UpdateCredentialRequest {
  recipientName?: string;
  recipientEmail?: string;
  eventId?: string;
  issuedDate?: string;
  expirationDate?: string;
  certificateUrl?: string;
  status?: CredentialStatus.DRAFT | CredentialStatus.ISSUED;
}

export interface PreviewCredentialRequest {
  eventId: string;
  recipientName: string;
  recipientEmail: string;
  issuedDate?: string;
  expirationDate?: string;
}

export const credentialService = {
  async getCredentials(filters?: CredentialFilters): Promise<PaginatedResponse<Credential>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Credential>>>(
      buildUrl('/credentials', filters),
    );
    return response.data.data;
  },

  async getCredential(id: string): Promise<Credential> {
    const response = await apiClient.get<ApiResponse<Credential>>(`/credentials/${id}`);
    return response.data.data;
  },

  async createCredential(data: CreateCredentialRequest): Promise<Credential> {
    const response = await apiClient.post<ApiResponse<Credential>>('/credentials', data);
    return response.data.data;
  },

  async createBatchCredentials(data: BatchCreateCredentialRequest): Promise<BatchResult> {
    const response = await apiClient.post<ApiResponse<BatchResult>>('/credentials/batch', data);
    return response.data.data;
  },

  async getBatchStatus(batchUuid: string): Promise<BatchStatus> {
    const response = await apiClient.get<ApiResponse<BatchStatus>>(
      `/credentials/batch/${batchUuid}/status`,
    );
    return response.data.data;
  },

  async generatePreview(data: PreviewCredentialRequest): Promise<{ previewUrl: string }> {
    const response = await apiClient.post<ApiResponse<{ previewUrl: string }>>(
      '/credentials/preview',
      data,
    );
    return response.data.data;
  },

  async updateCredential(id: string, data: UpdateCredentialRequest): Promise<Credential> {
    const response = await apiClient.patch<ApiResponse<Credential>>(`/credentials/${id}`, data);
    return response.data.data;
  },

  async resendCredential(id: string): Promise<{ sent: boolean }> {
    const response = await apiClient.post<ApiResponse<{ sent: boolean }>>(
      `/credentials/${id}/resend`,
    );
    return response.data.data;
  },

  async deleteCredential(id: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/credentials/${id}`,
    );
    return response.data.data;
  },

  async getPublicCredential(uuid: string): Promise<PublicCredential> {
    const response = await apiClient.get<ApiResponse<PublicCredential>>(
      `/credentials/public/${uuid}`,
    );
    return response.data.data;
  },
};
