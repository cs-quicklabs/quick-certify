/**
 * Team Service - API client for team management
 */

import { apiClient, ApiResponse } from './api-client';

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
  created_at: string;
  updated_at: string;
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
  roleId: string;
  organizationId: string;
}

export interface UpdateTeamMemberRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  roleId?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TeamFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const teamService = {
  async getTeamMembers(filters?: TeamFilters): Promise<PaginatedResponse<TeamMember>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamMember>>>(`/users?${params.toString()}`);
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
    const response = await apiClient.post<ApiResponse<TeamMember>>(`/users/${uuid}/cancel-invitation`, {});
    return response.data.data;
  },

  async resendInvitation(uuid: string): Promise<TeamMember> {
    const response = await apiClient.post<ApiResponse<TeamMember>>(`/users/${uuid}/resend-invitation`, {});
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
