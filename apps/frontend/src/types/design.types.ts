export type DesignType = 'certificate' | 'badge';

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
  name: string;
  type: DesignType;
  url: string;
  layout: string;
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
