import { AuditMetadata } from './audit.metadata.interface';
/**
 * Carries the actor and request context through the call stack.
 * Built once in the controller, passed into services — keeps services
 * decoupled from the HTTP layer.
 */
export interface AuditContext {
  /** The user performing the action. Null = system / scheduled job. */
  actor_id: number | null;
  metadata?: AuditMetadata;
}
