import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SessionEntity } from '@src/entities';
import { ISessionService, CreateSessionInput } from '../interfaces';

/**
 * Session Service Implementation
 *
 * SRP: Handles all session-related operations:
 * - Creating sessions
 * - Validating sessions
 * - Revoking sessions
 * - Updating session activity
 */
@Injectable()
export class SessionService implements ISessionService {
  constructor(
    @InjectModel(SessionEntity)
    private readonly sessionModel: typeof SessionEntity,
  ) {}

  async create(data: CreateSessionInput): Promise<SessionEntity> {
    return this.sessionModel.create({
      user_id: data.userId,
      expires_at: data.expiresAt,
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      device_type: data.deviceType || null,
      last_activity_at: new Date(),
    });
  }

  async findByHash(hash: string, userId: number): Promise<SessionEntity | null> {
    return this.sessionModel.findOne({
      where: {
        hash,
        user_id: userId,
      },
    });
  }

  async validate(hash: string, userId: number): Promise<SessionEntity | null> {
    const session = await this.sessionModel.findOne({
      where: {
        hash,
        user_id: userId,
        is_active: true,
      },
    });

    if (!session || !session.isValid) {
      return null;
    }

    return session;
  }

  async updateActivity(session: SessionEntity): Promise<void> {
    await session.update({ last_activity_at: new Date() });
  }

  async revoke(sessionHash: string): Promise<void> {
    const session = await this.sessionModel.findOne({
      where: { hash: sessionHash },
    });

    if (session) {
      await session.update({
        is_active: false,
        revoked_at: new Date(),
      });
    }
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.sessionModel.update(
      { is_active: false, revoked_at: new Date() },
      { where: { user_id: userId, is_active: true } },
    );
  }

  async getActiveForUser(userId: number): Promise<SessionEntity[]> {
    return this.sessionModel.findAll({
      where: {
        user_id: userId,
        is_active: true,
        revoked_at: null,
      },
      attributes: [
        'id',
        'hash',
        'ip_address',
        'user_agent',
        'device_type',
        'last_activity_at',
        'createdAt',
      ],
      order: [['last_activity_at', 'DESC']],
    });
  }

  async revokeByHashAndUser(hash: string, userId: number): Promise<boolean> {
    const session = await this.sessionModel.findOne({
      where: { hash, user_id: userId },
    });

    if (!session) {
      return false;
    }

    await session.update({ is_active: false, revoked_at: new Date() });
    return true;
  }
}
