/**
 * Team Service - API client for team management
 *
 * Uses centralized query params utility for consistent URL building.
 *
 * Uses centralized query params utility for consistent URL building.
 */

import { PaginatedResponse } from '@/types';
import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';
import { buildUrl } from '@/lib/query-params';

export interface TeamMember {
  id: string;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
  role: {
    id: string;
    role: string;
  };
  status: 'active' | 'inactive' | 'invited' | 'archived';
  last_login_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  role: string;
}

export interface CreateTeamMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional for invitations
  roleId: number;
  organizationId: string;
}

export interface UpdateTeamMemberRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  roleId?: number;
  status?: string;
}

export interface TeamFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}

export const teamService = {
  async getTeamMembers(filters?: TeamFilters): Promise<PaginatedResponse<TeamMember>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamMember>>>(
      buildUrl('/users', filters),
    );
    return response.data.data;
  },

  async getTeamMember(uuid: string): Promise<TeamMember> {
    const response = await apiClient.get<ApiResponse<TeamMember>>(`/users/${uuid}`);
    return response.data.data;
  },

  async createTeamMember(data: CreateTeamMemberRequest): Promise<TeamMember> {
    const response = await apiClient.post<ApiResponse<TeamMember>>('/users', data);
    return response.data.data;
  },

  async updateTeamMember(uuid: string, data: UpdateTeamMemberRequest): Promise<TeamMember> {
    const response = await apiClient.patch<ApiResponse<TeamMember>>(`/users/${uuid}`, data);
    return response.data.data;
  },

  async deleteTeamMember(uuid: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/users/${uuid}`);
    return response.data.data;
  },

  async cancelInvitation(uuid: string): Promise<TeamMember> {
    const response = await apiClient.post<ApiResponse<TeamMember>>(
      `/users/${uuid}/cancel-invitation`,
      {},
    );
    return response.data.data;
  },

  async resendInvitation(uuid: string): Promise<TeamMember> {
    const response = await apiClient.post<ApiResponse<TeamMember>>(
      `/users/${uuid}/resend-invitation`,
      {},
    );
    return response.data.data;
  },

  async restoreUser(uuid: string): Promise<TeamMember> {
    const response = await apiClient.post<ApiResponse<TeamMember>>(`/users/${uuid}/restore`, {});
    return response.data.data;
  },

  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Role>>>('/roles?limit=100');
    return response.data.data.data;
  },
};
