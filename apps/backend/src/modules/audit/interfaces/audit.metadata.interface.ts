export interface AuditMetadata {
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  request_id?: string;
  [key: string]: unknown; // extensible without breaking changes
}
