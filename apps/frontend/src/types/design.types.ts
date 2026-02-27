import type { DesignLayout } from '@certify/certificate-core';
export type {
  PlaceholderKey,
  DesignLayoutPlaceholder,
  DesignLayout,
} from '@certify/certificate-core';

export const DESIGN_TYPES = ['certificate', 'badge'] as const;
export type DesignType = (typeof DESIGN_TYPES)[number];

export type Design = {
  id: string;
  uuid: string;
  organization_id: number;
  name: string;
  type: DesignType;
  url: string;
  layout: DesignLayout | null;
  createdAt: string;
  updatedAt: string;
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
