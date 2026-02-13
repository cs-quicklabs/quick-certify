import { PaginatedResponse } from '@/types';
import { Credential, CredentialFilters } from '@/types/credential.types';
import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';

export interface CreateCredentialRequest {
  recipientName: string;
  recipientEmail: string;
  eventId: string;
  issuedDate?: string;
  expirationDate?: string;
  certificateUrl?: string;
  status?: 'draft' | 'issued';
}

export interface UpdateCredentialRequest {
  recipientName?: string;
  recipientEmail?: string;
  eventId?: string;
  issuedDate?: string;
  expirationDate?: string;
  certificateUrl?: string;
  status?: 'draft' | 'issued';
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

  async updateCredential(id: string, data: UpdateCredentialRequest): Promise<Credential> {
    const response = await apiClient.patch<ApiResponse<Credential>>(`/credentials/${id}`, data);
    return response.data.data;
  },

  async deleteCredential(id: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/credentials/${id}`,
    );
    return response.data.data;
  },
};
