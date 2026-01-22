import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { PasswordResetEntity } from '@src/entities/password-reset.entity';

/**
 * Password Reset Service
 *
 * SRP: Manages password reset tokens and operations
 */
@Injectable()
export class PasswordResetService {
  constructor(
    @InjectModel(PasswordResetEntity)
    private readonly passwordResetModel: typeof PasswordResetEntity,
  ) {}

  /**
   * Create a new password reset token
   */
  async create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetEntity> {
    return this.passwordResetModel.create({
      user_id: userId,
      token,
      expires_at: expiresAt,
      is_used: false,
    });
  }

  /**
   * Find a password reset token by token string
   */
  async findByToken(token: string): Promise<PasswordResetEntity | null> {
    return this.passwordResetModel.findOne({
      where: { token, is_used: false },
    });
  }

  /**
   * Check if a password reset token is valid
   * @throws BadRequestException if token is invalid or expired
   */
  async validateToken(token: string): Promise<PasswordResetEntity> {
    const passwordReset = await this.findByToken(token);
    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (passwordReset.isExpired) {
      await passwordReset.update({ is_used: true });
      throw new BadRequestException('Reset token has expired');
    }

    return passwordReset;
  }

  /**
   * Mark a password reset token as used
   */
  async markAsUsed(id: string, transaction?: Transaction): Promise<void> {
    const passwordReset = await this.passwordResetModel.findByPk(id, {
      ...(transaction && { transaction }),
    });
    if (!passwordReset) {
      throw new NotFoundException('Password reset token not found');
    }
    await passwordReset.update(
      { is_used: true, used_at: new Date() },
      { ...(transaction && { transaction }) },
    );
  }

  /**
   * Invalidate all unused password reset tokens for a user
   */
  async invalidateAllForUser(userId: string): Promise<void> {
    await this.passwordResetModel.update(
      { is_used: true },
      { where: { user_id: userId, is_used: false } },
    );
  }
}
