import { AuditContext } from './interfaces/audit.context.interface';
import { CurrentUser } from '../auth/interfaces/jwt-payload.interface';

/** Minimal shape the builder needs — works with both Express and NestJS request objects. */
interface AuditRequest {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  id?: string;
  user?: CurrentUser;
}

/**
 * Builds an AuditContext from the current HTTP request.
 * Call this once in your controller and pass it down to services.
 *
 * @example
 * // In your controller:
 * const auditContext = buildAuditContext(req);
 * await this.userService.archiveUser(userId, auditContext);
 */
export function buildAuditContext(req: AuditRequest): AuditContext {
  const currentUser = req.user;
  return {
    actor_id: currentUser?.id ?? null,
    metadata: {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] as string | undefined,
      request_id: req.id,
      role: currentUser?.role ?? undefined,
      organizationId: currentUser?.organizationId ?? undefined,
    },
  };
}
