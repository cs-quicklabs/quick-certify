export const DESIGN_TYPES = ['certificate', 'badge'] as const;
export type DesignType = (typeof DESIGN_TYPES)[number];

export type PlaceholderKey =
  | 'recipient.name'
  | 'recipient.email'
  | 'credential.id'
  | 'credential.issue_date'
  | 'credential.expiration_date'
  | 'event.name';

export interface DesignLayoutPlaceholder {
  id: string;
  type: 'text';
  key: PlaceholderKey;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight?: string;
  fontStyle?: string;
  color: string;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface DesignLayout {
  version: 2;
  canvasWidth: number;
  canvasHeight: number;
  placeholders: DesignLayoutPlaceholder[];
}

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
