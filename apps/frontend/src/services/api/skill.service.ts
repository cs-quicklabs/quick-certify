/**
 * Skill Service - API client for skill management
 */

import { PaginatedResponse } from '@/types';
import { apiClient, ApiResponse } from './api-client';

export interface Skill {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillRequest {
  name: string;
}

export interface UpdateSkillRequest {
  name?: string;
}

export interface SkillFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const skillService = {
  async getSkills(filters?: SkillFilters): Promise<PaginatedResponse<Skill>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Skill>>>(`/skills?${params.toString()}`);
    return response.data.data;
  },

  async getSkill(id: string): Promise<Skill> {
    const response = await apiClient.get<ApiResponse<Skill>>(`/skills/${id}`);
    return response.data.data;
  },

  async createSkill(data: CreateSkillRequest): Promise<Skill> {
    const response = await apiClient.post<ApiResponse<Skill>>('/skills', data);
    return response.data.data;
  },

  async updateSkill(id: string, data: UpdateSkillRequest): Promise<Skill> {
    const response = await apiClient.patch<ApiResponse<Skill>>(`/skills/${id}`, data);
    return response.data.data;
  },

  async deleteSkill(id: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/skills/${id}`);
    return response.data.data;
  },
};

