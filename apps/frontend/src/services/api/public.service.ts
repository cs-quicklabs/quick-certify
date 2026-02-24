import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';
import { Organization, Recipient, PaginatedResponse, Event } from '@/types';
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

  async getPublicCredentials(
    slug: string,
    filter: {
      page: 1;
      limit: 3;
      sortBy: 'created_at';
      sortOrder: 'DESC';
      search?: string;
      eventId?: string;
      recipientId?: string;
    },
  ) {
    const response = await apiClient.get(buildUrl(`/credentials/public/org/${slug}`, filter));
    return response.data.data;
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

  async getPublicEvent(slug: string, eventUuid: string): Promise<Event> {
    const response = await apiClient.get<ApiResponse<Event>>(
      `/events/public/org/${slug}/event/${eventUuid}`,
    );
    return response.data.data;
  },
};
