import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';
import { GlobalSearchResult } from '@/types';

export const searchService = {
  async globalSearch(query: string, limit = 5): Promise<GlobalSearchResult> {
    const response = await apiClient.get<ApiResponse<GlobalSearchResult>>(
      buildUrl('/search', { q: query, limit }),
    );
    return response.data.data;
  },
};
