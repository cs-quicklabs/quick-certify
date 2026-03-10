export enum PathwayStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export interface PathwayEvent {
  uuid: string;
  name: string;
  description?: string | null;
  duration_type?: string | null;
  duration_value?: number | null;
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
  status: PathwayStatus;
  is_active: boolean;
  duration: string | null;
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

export interface PublicPathway {
  uuid: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  status: PathwayStatus;
  duration?: string;
  participant_count: number;
  credential_count: number;
  events: PathwayEvent[];
  participants: { uuid: string; name: string; email: string }[];
  final_credential?: {
    name: string;
    description: string;
    image_url: string;
  };
}

export interface PublicPathwayCredential {
  uuid: string;
  name: string;
  summary: string;
  duration: string;
  image_url: string;
  status: 'earned' | 'not_earned';
  earned_date: string | null;
}

export interface PublicPathwayParticipant {
  uuid: string;
  name: string;
  email: string;
  status: string;
  joined_date: string;
  pathway_name: string;
  credentials: PublicPathwayCredential[];
}

export interface PublicPathwayFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}
