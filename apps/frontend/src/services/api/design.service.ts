/**
 * Design Service - API client for Design management
 */

import { apiClient, ApiResponse } from "./api-client";
import { DesignType } from "@/types/design.types";
import { PaginatedResponse } from "@/types";
import { buildUrl } from "@/lib/query-params";

export type Design = {
  id: string;
  name: string;
  type: DesignType;
  url: string;
  createdAt: string;
};

export interface DesignFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}


/**
 * Design Service Methods
 */
export const designService = {
  async getDesigns(filters?: DesignFilters): Promise<PaginatedResponse<Design>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Design>>>(buildUrl('/designs', filters));
    return response.data.data;
  },

  async getDesignById(id: string): Promise<Design> {
    const response = await apiClient.get(`/designs/${id}`);
    return response.data.data;
  },

  async createDesign(payload: {
    name: string;
    type: Design;
    imageUrl: string;
  }): Promise<{ success: boolean, message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean, message: string }>>('/designs', payload);
    return response.data;
  },

  async deleteDesign(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/designs/${id}`);
    return response.data;
  },

}
