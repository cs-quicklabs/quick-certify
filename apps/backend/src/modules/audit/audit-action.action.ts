/**
 * Namespaced audit action constants.
 * Add new actions here as your app grows — never use raw strings.
 */
export const AuditAction = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_ARCHIVED: 'user.archived',
  // USER_RESTORED: 'user.restored',
  // USER_ROLE_CHANGED: 'user.role_changed',
  // USER_STATUS_CHANGED: 'user.status_changed',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
