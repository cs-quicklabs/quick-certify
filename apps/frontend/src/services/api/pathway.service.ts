import { PaginatedResponse } from '@/types';
import { Pathway, PathwayFilters } from '@/types/pathway.types';
import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';

export interface CreatePathwayRequest {
  name: string;
  duration?: string;
  status?: string;
  credentialIds?: string[];
}

export interface UpdatePathwayRequest {
  name?: string;
  duration?: string;
  status?: string;
  credentialIds?: string[];
}

export const pathwayService = {
  async getPathways(filters?: PathwayFilters): Promise<PaginatedResponse<Pathway>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Pathway>>>(
      buildUrl('/pathways', filters),
    );
    return response.data.data;
  },

  async getPathway(id: string): Promise<Pathway> {
    const response = await apiClient.get<ApiResponse<Pathway>>(`/pathways/${id}`);
    return response.data.data;
  },

  async createPathway(data: CreatePathwayRequest): Promise<Pathway> {
    const response = await apiClient.post<ApiResponse<Pathway>>('/pathways', data);
    return response.data.data;
  },

  async updatePathway(id: string, data: UpdatePathwayRequest): Promise<Pathway> {
    const response = await apiClient.patch<ApiResponse<Pathway>>(`/pathways/${id}`, data);
    return response.data.data;
  },

  async deletePathway(id: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/pathways/${id}`);
    return response.data.data;
  },
};
