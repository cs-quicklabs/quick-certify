import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';
import {
  Organization,
  Recipient,
  PaginatedResponse,
  Event,
  PublicPathway,
  PublicPathwayParticipant,
  PublicPathwayFilters,
  PathwayParticipant,
} from '@/types';
import { BaseSearchFilters } from '@/lib/query-params';

export interface PublicCredentialFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  eventId?: string;
  recipientId?: string;
  [key: string]: unknown;
}

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

  async getPublicCredentials(slug: string, filter?: PublicCredentialFilters) {
    const response = await apiClient.get(buildUrl(`/credentials/public/org/${slug}`, filter));
    console.log('response   : ', response.data)
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

  async getPublicPathways(
    slug: string,
    filters?: PublicPathwayFilters,
  ): Promise<PaginatedResponse<PublicPathway>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<PublicPathway>>>(
      buildUrl(`/pathways/public/org/${slug}`, filters),
    );
    return response.data.data;
  },

  async getPublicPathway(slug: string, pathwayUuid: string): Promise<PublicPathway> {
    const response = await apiClient.get<ApiResponse<PublicPathway>>(
      `/pathways/public/org/${slug}/pathway/${pathwayUuid}`,
    );
    return response.data.data;
  },

  async getPublicPathwayParticipants(
    slug: string,
    pathwayUuid: string,
    filters?: PublicPathwayFilters,
  ): Promise<PaginatedResponse<PathwayParticipant>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<PathwayParticipant>>>(
      buildUrl(`/pathways/public/org/${slug}/pathway/${pathwayUuid}/participants`, filters),
    );
    return response.data.data;
  },

  async getPublicPathwayParticipant(
    slug: string,
    pathwayUuid: string,
    participantUuid: string,
  ): Promise<PublicPathwayParticipant> {
    const response = await apiClient.get<ApiResponse<PublicPathwayParticipant>>(
      `/pathways/public/org/${slug}/pathway/${pathwayUuid}/participant/${participantUuid}`,
    );
    return response.data.data;
  },
};
