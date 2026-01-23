import { SessionEntity } from '@src/entities';

/**
 * Session Service Interface
 * SRP: Single responsibility for session management
 */
export interface ISessionService {
  /**
   * Create a new session for a user
   */
  create(data: CreateSessionInput): Promise<SessionEntity>;

  /**
   * Find a session by hash and validate it
   */
  findByHash(hash: string, userId: number): Promise<SessionEntity | null>;

  /**
   * Validate if a session is still active and not expired
   */
  validate(hash: string, userUuid: string): Promise<SessionEntity | null>;

  /**
   * Update session's last activity timestamp
   */
  updateActivity(session: SessionEntity): Promise<void>;

  /**
   * Revoke a single session
   */
  revoke(sessionHash: string): Promise<void>;

  /**
   * Revoke all sessions for a user
   */
  revokeAllForUser(userUuid: string): Promise<void>;

  /**
   * Get all active sessions for a user
   */
  getActiveForUser(userId: number): Promise<SessionEntity[]>;

  /**
   * Revoke a session by hash and user ID
   */
  revokeByHashAndUser(sessionHash: string, userId: number): Promise<boolean>;
}

export interface CreateSessionInput {
  userId: number; // user ID (integer)
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
}

export const SESSION_SERVICE = Symbol('ISessionService');
