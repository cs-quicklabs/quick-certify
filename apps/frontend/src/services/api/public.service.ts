/**
 * Public Service - Api Client for Public Apis - Issuer Details, Events, Recipients
 *
 */

import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';
import { Organization } from '@/types';

export const publicService = {
  async getPublicOrganization(slug: string): Promise<Organization> {
    const response = await apiClient.get<ApiResponse<Organization>>(
      buildUrl(`/organizations/public/${slug}`),
    );
    return response.data.data;
  },
};
