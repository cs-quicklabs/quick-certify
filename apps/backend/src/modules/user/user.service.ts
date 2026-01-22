import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { UserEntity } from '@src/entities/user.entity';
import { RoleEntity } from '@src/entities/role.entity';
import { OrganizationEntity } from '@src/entities/organization.entity';
import { PasswordService, SessionService } from '@src/modules/auth/services';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { CurrentUser } from '../auth/interfaces';
import { EmailService } from '@src/commons/services';
import { Role } from '../role/enums';
import { capitalizeFirst } from '@src/commons/utils';
import { RoleService } from '../role/role.service';
import { OrganizationService } from '../organization/organization.service';

/**
 * Extended FindAllOptions for User Service
 * Includes additional fields for user-specific filtering
 */
export interface ExtendedFindAllOptions extends FindAllOptions {
  excludeUserId?: string;
  currentUserRole?: string;
  role?: string;
}

/**
 * User Service
 *
 * Extends BaseCrudService with string IDs (nanoid)
 * DIP: Uses PasswordService for password operations, RoleService for role operations, OrganizationService for organization operations
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
    private readonly roleService: RoleService,
    private readonly organizationService: OrganizationService,
    private readonly passwordService: PasswordService,
    private readonly mailService: EmailService,
    private readonly sessionService: SessionService,
  ) {
    super();
  }

  override async findAll(options: ExtendedFindAllOptions = {}): Promise<PaginatedResult<UserEntity>> {
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

    // Exclude current logged-in user if specified
    const excludeUserId = options.excludeUserId;
    const whereClause: Record<string, unknown> = {
      ...where,
      status: { [Op.ne]: 'archived' }, // Exclude archived users from listing
    };
    if (excludeUserId) {
      whereClause.id = { [Op.ne]: excludeUserId }; // Exclude current user from listing
    }

    const { count, rows } = await this.userModel.findAndCountAll({
      where: whereClause,
      include: [
        { model: RoleEntity, attributes: ['id', 'role'] },
        { model: OrganizationEntity, attributes: ['id', 'name', 'slug'] },
      ],
      attributes: { exclude: ['password_hash'] },
      order: sortBy === 'last_login_at' ? [[sortBy, `${sortOrder} NULLS LAST`]] : [[sortBy, sortOrder]],
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

  override async create(
    dto: CreateUserDto,
    currentUser?: CurrentUser,
    options?: { transaction?: Transaction },
  ): Promise<UserEntity> {
    // Validate email uniqueness globally (across all organizations)
    await this.validateEmailUniqueness(dto.email);

    // Validate organization
    const organization = await this.organizationService.findOne(dto.organizationId);
    if (!organization || !organization.is_active) {
      throw new NotFoundException('Organization not found or inactive');
    }

    // Validate role
    const role = await this.roleService.findOne(dto.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

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

    const createdUserResult = await this.userModel.create(
      {
        first_name: capitalizeFirst(dto.firstName),
        last_name: capitalizeFirst(dto.lastName),
        email: dto.email.toLowerCase(),
        password_hash: hashedPassword,
        organization_id: dto.organizationId,
        role_id: dto.roleId,
        status,
        is_email_notifications_enabled: true,
      },
      {
        ...(options?.transaction && { transaction: options.transaction }),
      },
    );

    if (!createdUserResult) {
      throw new Error('Failed to create user');
    }

    const createdUser = createdUserResult as UserEntity;

    // Send invitation email if invitation, otherwise welcome email
    if (isInvitation) {
      const inviterName = currentUser
        ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
        : 'Administrator';
      const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/invitation?token=${createdUser.id}`;
      this.mailService
        .sendInvitationEmail(createdUser.email, {
          name: createdUser.first_name,
          inviterName,
          organizationName: organization.name,
          inviteLink,
        })
        .catch(console.error);
    } else {
      this.mailService.sendWelcomeEmail(createdUser.email, { name: createdUser.first_name }).catch(console.error);
    }

    return this.findOne(createdUser.id) as Promise<UserEntity>;
  }

  override async update(id: string, dto: UpdateUserDto, options?: { transaction?: Transaction }): Promise<UserEntity> {
    const user = await this.findOneOrThrow(id);
    const previousRoleId = user.role_id;
    const previousStatus = user.status;

    // If status is being changed to archived, handle it as soft delete
    if (dto.status && dto.status === 'archived' && previousStatus !== 'archived') {
      // Update status to archived (soft delete)
      await user.update({ status: 'archived' }, { ...(options?.transaction && { transaction: options.transaction }) });
      // Logout user from all devices when archived
      await this.logoutUserFromAllDevices(user.id, options?.transaction);
      // Return the archived user (need to find it without the archived filter)
      return this.userModel.findOne({
        where: { id },
        include: [
          { model: RoleEntity, attributes: ['id', 'role'] },
          { model: OrganizationEntity, attributes: ['id', 'name', 'slug'] },
        ],
        attributes: { exclude: ['password_hash'] },
        ...(options?.transaction && { transaction: options.transaction }),
      }) as Promise<UserEntity>;
    }

    // Validate email if changing
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      await this.validateEmailUniqueness(dto.email, id);
    }

    // Validate role if changing
    if (dto.roleId) {
      const role = await this.roleService.findOne(dto.roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    // Hash password if provided (password in DTO is plain text, needs hashing)
    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await this.passwordService.hash(dto.password);
    }

    const updateData = this.buildUpdateData(dto, hashedPassword);
    
    // Check if role or status is changing (requires atomic update + session revocation)
    const roleChanged = dto.roleId && dto.roleId !== previousRoleId;
    const statusChangedToInactive = dto.status && dto.status !== previousStatus && dto.status === 'inactive';
    const needsTransaction = (roleChanged || statusChangedToInactive) && !options?.transaction;

    // Use transaction if role/status changes and no transaction provided
    if (needsTransaction) {
      if (!this.userModel.sequelize) {
        throw new Error('Sequelize instance not available');
      }
      const transaction = await this.userModel.sequelize.transaction();
      try {
        await user.update(updateData, { transaction });
        
        // If role changed, logout user from all devices (force re-login)
        if (roleChanged) {
          await this.logoutUserFromAllDevices(user.id, transaction);
        }

        // If status changed to inactive, logout user from all devices
        if (statusChangedToInactive) {
          await this.logoutUserFromAllDevices(user.id, transaction);
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      // No transaction needed or transaction already provided
      await user.update(updateData, { ...(options?.transaction && { transaction: options.transaction }) });

      // If role changed, logout user from all devices (force re-login)
      if (roleChanged) {
        await this.logoutUserFromAllDevices(user.id, options?.transaction);
      }

      // If status changed to inactive, logout user from all devices
      if (statusChangedToInactive) {
        await this.logoutUserFromAllDevices(user.id, options?.transaction);
      }
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
    const user = await this.userModel.findByPk(id);
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
    const organization = await this.organizationService.findOne(user.organization_id);
    if (organization) {
      this.mailService
        .sendInvitationEmail(user.email, {
          name: user.first_name,
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
    options: ExtendedFindAllOptions = {},
  ): Promise<PaginatedResult<UserEntity>> {
    const whereClause: Record<string, unknown> = {
      ...options.where,
      organization_id: organizationId,
    };

    // Apply role-based filtering (extracted to avoid duplication)
    await this.applyRoleFiltering(whereClause, options);

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
    options: ExtendedFindAllOptions = {},
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

    // Apply role-based filtering (extracted to avoid duplication)
    await this.applyRoleFiltering(whereClause, options);

    return this.findAll({
      ...options,
      where: whereClause,
      sortBy: options.sortBy || 'last_login_at',
      sortOrder: (options.sortOrder || 'DESC') as 'ASC' | 'DESC',
    });
  }

  // Private validation helpers (SRP - validation logic)

  /**
   * Validate user status for authentication operations
   * Centralizes status validation logic to avoid duplication
   * @throws UnauthorizedException if user is archived or inactive
   */
  validateUserStatusForAuth(user: UserEntity): void {
    if (user.status === 'archived') {
      throw new UnauthorizedException(
        'Your account is deactivated. Please connect with your admin.',
      );
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
      );
    }
  }

  /**
   * Validate user status for password reset operations
   * Centralizes status validation logic to avoid duplication
   * @throws UnauthorizedException if user is archived or inactive
   */
  validateUserStatusForPasswordReset(user: UserEntity): void {
    if (user.status === 'archived') {
      throw new UnauthorizedException(
        'Your account is deactivated. For more queries reach out to admin.',
      );
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
      );
    }
  }

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

  /**
   * Get excluded roles based on current user's role for visibility filtering
   * Super Admin can see: Admin, Manager, Designer (exclude: super_admin)
   * Admin can see: Manager, Designer (exclude: super_admin, admin)
   * Lower level users: exclude super_admin and admin (defense in depth)
   */
  private getExcludedRolesForVisibility(currentUserRole: string): string[] {
    const role = currentUserRole.toLowerCase();

    if (role === Role.SUPER_ADMIN) {
      // Super Admin cannot see other Super Admins
      return [Role.SUPER_ADMIN];
    } else if (role === Role.ADMIN) {
      // Admin cannot see Super Admin or other Admins
      return [Role.SUPER_ADMIN, Role.ADMIN];
    } else {
      // Lower level users (manager, designer) cannot see Super Admin or Admin
      return [Role.SUPER_ADMIN, Role.ADMIN];
    }
  }

  /**
   * Get role IDs by role names
   */
  private async getRoleIdsByNames(roleNames: string[]): Promise<string[]> {
    const roles = await Promise.all(roleNames.map((name) => this.roleService.findByRole(name)));
    return roles.filter((r) => r !== null && r !== undefined).map((r) => {
      if (r === null || r === undefined) {
        throw new Error('Role should not be null after filter');
      }
      return r.id;
    });
  }

  /**
   * Apply role-based filtering to where clause
   * Centralizes role filtering logic to avoid duplication
   * @param whereClause - The where clause to modify
   * @param options - ExtendedFindAllOptions with optional role filtering
   */
  private async applyRoleFiltering(
    whereClause: Record<string, unknown>,
    options: ExtendedFindAllOptions,
  ): Promise<void> {
    // Apply role-based visibility filtering
    // Super Admin can see: Admin, Manager, Designer (not other Super Admins)
    // Admin can see: Manager, Designer (not Super Admin, not other Admins)
    let excludedRoleIds: string[] = [];
    if (options.currentUserRole) {
      const excludedRoles = this.getExcludedRolesForVisibility(options.currentUserRole);
      if (excludedRoles.length > 0) {
        excludedRoleIds = await this.getRoleIdsByNames(excludedRoles);
      }
    }

    // Handle role filtering - need to find role IDs first
    let roleIds: string[] | undefined;
    if (options.role) {
      const roleFilter = options.role.toLowerCase();
      // Admin filter should include both admin and super_admin
      if (roleFilter === 'admin') {
        const superAdminRole = await this.roleService.findByRole(Role.SUPER_ADMIN);
        const adminRole = await this.roleService.findByRole(Role.ADMIN);
        roleIds = [superAdminRole?.id, adminRole?.id].filter(Boolean) as string[];
      } else {
        const role = await this.roleService.findByRole(roleFilter);
        if (role) {
          roleIds = [role.id];
        }
      }
      if (roleIds && roleIds.length > 0) {
        // Filter out excluded roles from the role filter
        roleIds = roleIds.filter((id) => !excludedRoleIds.includes(id));
        if (roleIds.length > 0) {
          whereClause.role_id = { [Op.in]: roleIds };
        } else {
          // Return empty result if all roles are excluded
          whereClause.role_id = { [Op.eq]: null };
        }
      } else {
        // Return empty result if role not found
        whereClause.role_id = { [Op.eq]: null };
      }
    } else if (excludedRoleIds.length > 0) {
      // Apply role-based visibility exclusion when no specific role filter
      whereClause.role_id = { [Op.notIn]: excludedRoleIds };
    }
  }

  private buildUpdateData(dto: UpdateUserDto, hashedPassword?: string): Partial<UserEntity> {
    const updateData: Partial<UserEntity> = {};

    if (dto.first_name) updateData.first_name = capitalizeFirst(dto.first_name);
    if (dto.last_name) updateData.last_name = capitalizeFirst(dto.last_name);
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.profile_picture !== undefined) updateData.avatar_url = dto.profile_picture;
    if (dto.is_email_notifications_enabled !== undefined)
      updateData.is_email_notifications_enabled = dto.is_email_notifications_enabled;
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase();
    if (dto.roleId !== undefined) updateData.role_id = dto.roleId;
    if (dto.status !== undefined) updateData.status = dto.status;
    // Handle password (hashed password passed separately)
    if (hashedPassword) updateData.password_hash = hashedPassword;
    // Handle OAuth fields
    if (dto.google_id !== undefined) updateData.google_id = dto.google_id;
    if (dto.auth_provider !== undefined) updateData.auth_provider = dto.auth_provider;
    // Handle last login timestamp
    if (dto.last_login_at !== undefined) updateData.last_login_at = dto.last_login_at;

    return updateData;
  }

  private async logoutUserFromAllDevices(userId: string, transaction?: Transaction): Promise<void> {
    await this.sessionService.revokeAllForUser(userId, transaction);
  }
}
