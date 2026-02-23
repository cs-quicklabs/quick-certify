export enum PathwayStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export interface PathwayEvent {
  uuid: string;
  name: string;
  pathway_event?: {
    order: number;
    is_final: boolean;
  };
  design?: {
    uuid: string;
    name: string;
    url: string;
    type: string;
  } | null;
}

export interface PathwayParticipant {
  id: number;
  pathway_id: number;
  recipient_id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  recipient: {
    uuid: string;
    name: string;
    email: string;
  };
}

export interface Pathway {
  uuid: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  duration: string | null;
  status: PathwayStatus;
  is_active: boolean;
  events: PathwayEvent[];
  participants: { uuid: string; name: string; email: string }[];
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
