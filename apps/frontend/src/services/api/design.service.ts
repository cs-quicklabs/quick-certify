/**
 * Design Service - API client for Design management
 */

import { apiClient, ApiResponse } from './api-client';
import { DesignType, Design, DesignFilters } from '@/types';
import { PaginatedResponse } from '@/types';
import { buildUrl } from '@/lib/query-params';

/**
 * Design Service Methods
 */
export const designService = {
  async getDesigns(filters?: DesignFilters): Promise<PaginatedResponse<Design>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Design>>>(
      buildUrl('/designs', filters),
    );
    return response.data.data;
  },

  async getDesignById(id: string): Promise<Design> {
    const response = await apiClient.get(`/designs/${id}`);
    return response.data.data;
  },

  async createDesign(payload: {
    name: string;
    designType: DesignType;
    designUrl: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      '/designs',
      payload,
    );
    return response.data;
  },

  /**
   * Update an existing design
   */
  async updateDesign(
    id: string,
    payload: {
      name: string;
      designType: 'certificate' | 'badge';
      designUrl: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch<ApiResponse<{ success: boolean; message: string }>>(
      `/designs/${id}`,
      payload,
    );
    return response.data;
  },

  async deleteDesign(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/designs/${id}`);
    return response.data.data;
  },
};
