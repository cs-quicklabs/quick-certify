import { PaginatedResponse } from '@/types';
import { Pathway, PathwayFilters, PathwayParticipant } from '@/types/pathway.types';
import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';

export interface PathwayEventInput {
  eventId: string;
  isFinal?: boolean;
}

export interface CreatePathwayRequest {
  name: string;
  description?: string;
  bannerUrl?: string;
  status?: string;
  events?: PathwayEventInput[];
}

export interface UpdatePathwayRequest {
  name?: string;
  description?: string | null;
  bannerUrl?: string | null;
  status?: string;
  events?: PathwayEventInput[];
}

export interface AddParticipantRequest {
  name: string;
  email: string;
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

  async getParticipants(
    pathwayUuid: string,
    filters?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  ): Promise<PaginatedResponse<PathwayParticipant>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<PathwayParticipant>>>(
      buildUrl(`/pathways/${pathwayUuid}/participants`, filters),
    );
    return response.data.data;
  },

  async addParticipant(
    pathwayUuid: string,
    data: AddParticipantRequest,
  ): Promise<PathwayParticipant> {
    const response = await apiClient.post<ApiResponse<PathwayParticipant>>(
      `/pathways/${pathwayUuid}/participants`,
      data,
    );
    return response.data.data;
  },
};
