export interface OrganizationOwner {
  id: string;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Organization {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  slogan: string;
  linkedin_company_id: string;
  website: string;
  linkedin_url: string;
  facebook_url: string;
  twitter_url: string;
  logo_url: string;
  favicon_url: string;
  banner_url: string;
  portal_enabled: boolean;
  is_active: boolean;
  issuer_verified: boolean;
  createdAt: string;
  updatedAt: string;
  users: OrganizationOwner[];
}

export interface OrganizationFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}
