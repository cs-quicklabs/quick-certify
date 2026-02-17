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

  async sendContactEmail(slug: string, data: { name: string; email: string; message: string }) {
    const response = await apiClient.post(`/organizations/public/${slug}/contact`, data);
    return response.data;
  },

  async getRecentlyIssuedCredentials(
    slug: string,
    filter: { page: number; limit: number; sortBy: string; sortOrder: string },
  ) {
    const response = await apiClient.get(
      `/credentials/public/org/${slug}?page=${filter.page}&limit=${filter.limit}&sortBy=${filter.sortBy}&sortOrder=${filter.sortOrder}`,
    );
    return response.data.data;
  },
};
