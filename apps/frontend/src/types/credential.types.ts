import { CredentialStatusEnum, BatchStatusEnum } from '@certify/certificate-core';
export { CredentialStatusEnum, BatchStatusEnum };
export { CredentialStatusEnum as CredentialStatus };

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
  certificate_pdf_url: string | null;
  status: CredentialStatusEnum;
  batch_id: number | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BatchResult {
  batchUuid: string;
  totalCount: number;
}

export interface BatchStatus {
  uuid: string;
  status: BatchStatusEnum;
  totalCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  errorDetails: Array<{ credentialId: number; error: string }> | null;
}

export interface PublicCredential {
  uuid: string;
  recipientName: string;
  eventName: string;
  issuedDate: string | null;
  expirationDate: string | null;
  certificateUrl: string | null;
  certificatePdfUrl: string | null;
  organization: {
    name: string;
    description: string;
    logoUrl: string | null;
    website: string;
    slogan: string | null;
    slug: string;
    supportEmail: string;
    linkedinID: string;
    linkedinUrl: string;
    facebookUrl: string;
    twitterUrl: string;
    faviconUrl: string | null;
    bannerUrl: string | null;
  };
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
