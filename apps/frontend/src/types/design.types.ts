export const DESIGN_TYPES = ['certificate', 'badge'] as const;
export type DesignType = (typeof DESIGN_TYPES)[number];

export interface DesignLayout {
  placeholders: Array<{
    id: string;
    type: 'text';
    key: 'recipient.name' | 'recipient.email';
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fontWeight?: string;
    color: string;
    align?: 'left' | 'center' | 'right';
  }>;
}

export type Design = {
  id: string;
  uuid: string;
  organization_id: number;
  name: string;
  type: DesignType;
  url: string;
  layout: string;
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
