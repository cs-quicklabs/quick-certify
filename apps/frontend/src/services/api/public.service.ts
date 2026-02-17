import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';
import { Organization, Recipient, PaginatedResponse } from '@/types';
import { BaseSearchFilters } from '@/lib/query-params';

/**
 * Public Service - Api Client for Public Apis - Issuer Details, Events, Recipients
 *
 */

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
    filter: { page: 1; limit: 3; sortBy: 'created_at'; sortOrder: 'DESC' },
  ) {
    const response = await apiClient.get(
      `/credentials/public/${slug}?page=${filter.page}&limit=${filter.limit}&sortBy=${filter.sortBy}&sortOrder=${filter.sortOrder}`,
    );
    return response.data;
  },

  async getRecipientPublic(
    slug: string,
    filters?: BaseSearchFilters,
  ): Promise<PaginatedResponse<Recipient>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Recipient>>>(
      buildUrl(`/recipients/public/org/${slug}`, filters),
    );
    return response.data.data;
  },
};
