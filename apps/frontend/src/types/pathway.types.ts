export enum PathwayStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export interface Pathway {
  uuid: string;
  name: string;
  credentials: { uuid: string; name: string }[];
  participants: number;
  duration: string;
  status: PathwayStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PathwayFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}
