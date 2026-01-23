import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity, RoleEntity, OrganizationEntity } from '@src/entities';
import { UpdateProfileDto, UpdateEmailPreferencesDto } from './dto';
import { StorageService } from '@src/commons/services';
import { capitalizeFirst } from '@src/commons/utils';

/**
 * Profile Service
 *
 * Handles user profile-related operations including:
 * - Getting user profile information
 * - Updating profile (name, avatar)
 * - Managing email notification preferences
 */
@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(UserEntity)
    private readonly userModel: typeof UserEntity,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Get full user profile with additional details
   */
  async getFullProfile(userId: number) {
    const user = await this.userModel.findByPk(userId, {
      include: [
        { model: RoleEntity, attributes: ['id', 'role'] },
        { model: OrganizationEntity, attributes: ['id', 'name', 'slug'] },
      ],
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: user.full_name,
      avatarUrl: user.avatar_url ?? null,
      organizationId: user.organization_id,
      organizationName: user.organization?.name || '',
      roleId: user.role_id,
      role: user.role?.role || '',
      signupMethod: user.auth_provider === 'google' ? 'google' : 'email',
      emailNotifications: user.is_email_notifications_enabled,
      status: user.status,
      lastLoginAt: user.last_login_at,
    };
  }

  /**
   * Update user profile
   * Automatically deletes old avatar from storage when replaced
   */
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar from storage if being replaced or removed
    if (dto.avatarUrl !== undefined && user.avatar_url) {
      if (dto.avatarUrl !== user.avatar_url || dto.avatarUrl === '' || dto.avatarUrl === null) {
        // Old avatar is being replaced or removed - delete from storage
        await this.storageService.deleteFileByUrl(user.avatar_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
    }

    const updateData: Partial<UserEntity> = {
      first_name: capitalizeFirst(dto.firstName), // firstName is always required
    };

    // Only update optional fields if provided
    if (dto.lastName !== undefined) {
      updateData.last_name = dto.lastName ? capitalizeFirst(dto.lastName) : null;
    }
    if (dto.avatarUrl !== undefined) {
      updateData.avatar_url = dto.avatarUrl === '' ? null : dto.avatarUrl;
    }

    await user.update(updateData);

    return {
      message: 'Profile updated successfully',
      user: await this.getFullProfile(userId),
    };
  }

  /**
   * Update email preferences
   */
  async updateEmailPreferences(userId: number, dto: UpdateEmailPreferencesDto) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.emailNotifications !== undefined) {
      await user.update({ is_email_notifications_enabled: dto.emailNotifications });
    }

    return {
      message: 'Email preferences updated successfully',
      emailNotifications: user.is_email_notifications_enabled,
    };
  }

  /**
   * Get email preferences
   */
  async getEmailPreferences(userId: number) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      emailNotifications: user.is_email_notifications_enabled,
    };
  }
}
