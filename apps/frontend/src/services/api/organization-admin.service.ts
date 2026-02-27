/**
 * Organization Admin Service - API client for system admin organization management
 *
 * Used by system_admin role to manage organizations across the platform.
 */

import { PaginatedResponse } from '@/types';
import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';
import { OrganizationFilters, Organization } from '@/types';
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
