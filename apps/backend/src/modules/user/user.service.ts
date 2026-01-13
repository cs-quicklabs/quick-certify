import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { UserEntity } from '@src/entities/user.entity';
import { RoleEntity } from '@src/entities/role.entity';
import { OrganizationEntity } from '@src/entities/organization.entity';
import { PasswordService, SessionService } from '@src/modules/auth/services';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { CurrentUser } from '../auth/interfaces';
import { EmailService } from '@src/commons/services';
import { Role } from '../role/enums';

/**
 * User Service
 *
 * Extends BaseCrudService with string IDs (nanoid)
 * DIP: Uses PasswordService for password operations
 * SRP: Manages user CRUD only
 * Note: Overrides soft delete methods to use status field instead of deleted_at
 */
@Injectable()
export class UserService extends BaseCrudService<UserEntity, CreateUserDto, UpdateUserDto, string> {
  protected override readonly model = UserEntity;
  protected override readonly entityName = 'User';
  protected override readonly softDeleteField: string | null = null; // Use status field instead
  protected override readonly defaultSortField: string = 'last_login_at';
  protected override readonly defaultSortOrder: 'ASC' | 'DESC' = 'DESC';

  constructor(
    @InjectModel(UserEntity)
    private readonly userModel: typeof UserEntity,
    @InjectModel(RoleEntity)
    private readonly roleModel: typeof RoleEntity,
    @InjectModel(OrganizationEntity)
    private readonly organizationModel: typeof OrganizationEntity,
    private readonly passwordService: PasswordService,
    private readonly mailService: EmailService,
    private readonly sessionService: SessionService,
  ) {
    super();
  }

  override async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<UserEntity>> {
    const {
      page = 1,
      limit = this.defaultLimit,
      sortBy = this.defaultSortField,
      sortOrder = this.defaultSortOrder,
      where = {},
    } = options;

    const safeLimit = Math.min(Math.max(1, limit), this.maxLimit);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.userModel.findAndCountAll({
      where: {
        ...where,
      },
      include: [
        { model: RoleEntity, attributes: ['id', 'role'] },
        { model: OrganizationEntity, attributes: ['id', 'name', 'slug'] },
      ],
      attributes: { exclude: ['password_hash'] },
      order: [[sortBy, sortOrder]],
      limit: safeLimit,
      offset,
    });

    const totalPages = Math.ceil(count / safeLimit);

    return {
      data: rows,
      meta: {
        total: count,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  override async findOne(id: string): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { id, status: { [Op.ne]: 'archived' } },
      include: [
        { model: RoleEntity, attributes: ['id', 'role'] },
        { model: OrganizationEntity, attributes: ['id', 'name', 'slug'] },
      ],
      attributes: { exclude: ['password_hash'] },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { email: email.toLowerCase(), status: { [Op.ne]: 'archived' } },
      include: [RoleEntity],
    });
  }

  override async create(dto: CreateUserDto, currentUser?: CurrentUser): Promise<UserEntity> {
    // Validate email uniqueness globally (across all organizations)
    await this.validateEmailUniqueness(dto.email);

    // Validate organization
    const organization = await this.validateOrganization(dto.organizationId);

    // Validate role
    const role = await this.validateRole(dto.roleId);

    // Super admin users can only be created by super admin users
    if (currentUser?.role !== Role.SUPER_ADMIN && role.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('You are not authorized to create a super admin user.');
    }

    // Determine if this is an invitation (no password provided)
    const isInvitation = !dto.password;
    const status = isInvitation ? 'invited' : 'active';

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (dto.password) {
      hashedPassword = await this.passwordService.hash(dto.password);
    }

    const user = await this.userModel.create({
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email.toLowerCase(),
      password_hash: hashedPassword,
      organization_id: dto.organizationId,
      role_id: dto.roleId,
      status,
      is_email_notifications_enabled: true,
    });

    // Send invitation email if invitation, otherwise welcome email
    if (isInvitation) {
      const inviterName = currentUser
        ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
        : 'Administrator';
      const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/invitation?token=${user.id}`;
      this.mailService
        .sendInvitationEmail(user.email, {
          inviterName,
          organizationName: organization.name,
          inviteLink,
        })
        .catch(console.error);
    } else {
      this.mailService.sendWelcomeEmail(user.email, { name: user.first_name }).catch(console.error);
    }

    return this.findOne(user.id) as Promise<UserEntity>;
  }

  override async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOneOrThrow(id);
    const previousRoleId = user.role_id;
    const previousStatus = user.status;

    // Validate email if changing
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      await this.validateEmailUniqueness(dto.email, id);
    }

    // Validate role if changing
    if (dto.roleId) {
      await this.validateRole(dto.roleId);
    }

    const updateData = this.buildUpdateData(dto);
    await user.update(updateData);

    // If role changed, logout user from all devices (force re-login)
    if (dto.roleId && dto.roleId !== previousRoleId) {
      await this.logoutUserFromAllDevices(user.id);
    }

    // If status changed to inactive, logout user from all devices
    if (dto.status && dto.status !== previousStatus && dto.status === 'inactive') {
      await this.logoutUserFromAllDevices(user.id);
    }

    return this.findOne(id) as Promise<UserEntity>;
  }

  override async softDelete(id: string): Promise<boolean> {
    const user = await this.findOneOrThrow(id);
    await user.update({ status: 'archived' });
    // Logout user from all devices when deactivated
    await this.logoutUserFromAllDevices(user.id);
    return true;
  }

  override async restore(id: string): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { id, status: 'archived' },
    });

    if (!user) {
      throw new NotFoundException('User not found or not archived');
    }

    await user.update({ status: 'active' });
    return this.findOne(id) as Promise<UserEntity>;
  }

  async cancelInvitation(id: string): Promise<UserEntity> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'invited') {
      throw new BadRequestException('User is not in invited status');
    }

    await user.update({ status: 'inactive' });
    return this.findOne(id) as Promise<UserEntity>;
  }

  async resendInvitation(id: string, currentUser?: CurrentUser): Promise<UserEntity> {
    const user = await this.userModel.findByPk(id, {
      include: [OrganizationEntity],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'inactive') {
      throw new BadRequestException('User is not in inactive status');
    }

    // Update status to invited
    await user.update({ status: 'invited' });

    // Send invitation email
    const inviterName = currentUser
      ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
      : 'Administrator';
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/invitation?token=${user.id}`;
    const organization = await this.organizationModel.findByPk(user.organization_id);
    if (organization) {
      this.mailService
        .sendInvitationEmail(user.email, {
          inviterName,
          organizationName: organization.name,
          inviteLink,
        })
        .catch(console.error);
    }

    return this.findOne(id) as Promise<UserEntity>;
  }

  // Multi-tenant methods
  override async findAllByOrganization(
    organizationId: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<UserEntity>> {
    const whereClause: Record<string, unknown> = {
      ...options.where,
      organization_id: organizationId,
    };

    // Handle role filtering - need to find role IDs first
    let roleIds: string[] | undefined;
    if ((options as any).role) {
      const roleFilter = (options as any).role.toLowerCase();
      // Admin filter should include both admin and super_admin
      if (roleFilter === 'admin') {
        const roles = await this.roleModel.findAll({
          where: { role: { [Op.in]: ['admin', 'super_admin'] } },
        });
        roleIds = roles.map((r) => r.id);
      } else {
        const role = await this.roleModel.findOne({
          where: { role: roleFilter },
        });
        if (role) {
          roleIds = [role.id];
        }
      }
      if (roleIds && roleIds.length > 0) {
        whereClause.role_id = { [Op.in]: roleIds };
      } else {
        // Return empty result if role not found
        whereClause.role_id = { [Op.eq]: null };
      }
    }

    return this.findAll({
      ...options,
      where: whereClause,
    });
  }

  async findOneByUuidAndOrganization(
    uuid: string,
    organizationId: string,
  ): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { id: uuid, organization_id: organizationId },
      include: [
        { model: RoleEntity, attributes: ['id', 'role'] },
        { model: OrganizationEntity, attributes: ['id', 'name', 'slug'] },
      ],
      attributes: { exclude: ['password_hash'] },
    });
  }

  async searchUsers(
    organizationId: string,
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<UserEntity>> {
    const searchCondition = {
      [Op.or]: [
        { first_name: { [Op.iLike]: `%${searchQuery}%` } },
        { last_name: { [Op.iLike]: `%${searchQuery}%` } },
        { email: { [Op.iLike]: `%${searchQuery}%` } },
      ],
    };

    const whereClause: Record<string, unknown> = {
      ...options.where,
      organization_id: organizationId,
      ...searchCondition,
    };

    // Handle role filtering - need to find role IDs first
    let roleIds: string[] | undefined;
    if ((options as any).role) {
      const roleFilter = (options as any).role.toLowerCase();
      // Admin filter should include both admin and super_admin
      if (roleFilter === 'admin') {
        const roles = await this.roleModel.findAll({
          where: { role: { [Op.in]: ['admin', 'super_admin'] } },
        });
        roleIds = roles.map((r) => r.id);
      } else {
        const role = await this.roleModel.findOne({
          where: { role: roleFilter },
        });
        if (role) {
          roleIds = [role.id];
        }
      }
      if (roleIds && roleIds.length > 0) {
        whereClause.role_id = { [Op.in]: roleIds };
      } else {
        // Return empty result if role not found
        whereClause.role_id = { [Op.eq]: null };
      }
    }

    return this.findAll({
      ...options,
      where: whereClause,
    });
  }

  // Private validation helpers (SRP - validation logic)

  private async findOneOrThrow(id: string): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { id, status: { [Op.ne]: 'archived' } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async validateEmailUniqueness(email: string, excludeId?: string): Promise<void> {
    // Email must be unique globally across all organizations (including archived users)
    const whereClause: Record<string, unknown> = {
      email: email.toLowerCase(),
    };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingUser = await this.userModel.findOne({ where: whereClause });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
  }

  private async validateOrganization(organizationId: string): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findByPk(organizationId);
    if (!organization || !organization.is_active) {
      throw new NotFoundException('Organization not found or inactive');
    }
    return organization;
  }

  private async validateRole(roleId: string): Promise<RoleEntity> {
    const role = await this.roleModel.findByPk(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private buildUpdateData(dto: UpdateUserDto): Partial<UserEntity> {
    const updateData: Partial<UserEntity> = {};

    if (dto.first_name) updateData.first_name = dto.first_name;
    if (dto.last_name) updateData.last_name = dto.last_name;
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.profile_picture !== undefined) updateData.avatar_url = dto.profile_picture;
    if (dto.is_email_notifications_enabled !== undefined)
      updateData.is_email_notifications_enabled = dto.is_email_notifications_enabled;
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase();
    if (dto.roleId !== undefined) updateData.role_id = dto.roleId;
    if (dto.status !== undefined) updateData.status = dto.status;

    return updateData;
  }

  private async logoutUserFromAllDevices(userId: string): Promise<void> {
    await this.sessionService.revokeAllForUser(userId);
  }
}
