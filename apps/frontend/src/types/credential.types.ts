export interface Recipient {
  uuid: string;
  name: string;
  email: string;
}

export interface Credential {
  id: string;
  uuid: string;
  recipient_id: number;
  recipient?: Recipient;
  event_id: number;
  event?: {
    uuid: string;
    name: string;
  };
  issued_date: string | null;
  expiration_date: string | null;
  certificate_url: string | null;
  status: 'draft' | 'issued';
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialFilters {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}
