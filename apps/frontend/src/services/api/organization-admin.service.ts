/**
 * Organization Admin Service - API client for system admin organization management
 *
 * Used by system_admin role to manage organizations across the platform.
 */

import { PaginatedResponse } from '@/types';
import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';

export interface OrganizationOwner {
  id: string;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Organization {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  owner?: OrganizationOwner | null;
}

export interface OrganizationFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}

export const organizationAdminService = {
  async getOrganizations(filters?: OrganizationFilters): Promise<PaginatedResponse<Organization>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Organization>>>(
      buildUrl('/organizations', filters),
    );
    return response.data.data;
  },

  async permanentlyDeleteOrganization(uuid: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/organizations/${uuid}`,
    );
    return response.data.data;
  },
};
