import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Op, Sequelize, Transaction } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { UserEntity } from '@src/entities/user.entity';
import { RoleEntity } from '@src/entities/role.entity';
import { OrganizationEntity } from '@src/entities/organization.entity';
import { PasswordService, SessionService } from '@src/modules/auth/services';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction } from '../audit/audit-action.action';
import { AuditContext } from '../audit/interfaces/audit.context.interface';
import { CurrentUser } from '../auth/interfaces';
import { EmailService } from '@src/commons/services';
import { Role } from '../role/enums';
import { RoleService } from '../role/role.service';
import { OrganizationService } from '../organization/organization.service';
import { AuthProvider } from '@src/commons/constants';

/**
 * Extended FindAllOptions for User Service
 * Includes additional fields for user-specific filtering
 */
export interface ExtendedFindAllOptions extends FindAllOptions {
  excludeUserId?: number; // User ID (number) to exclude
  excludeUserUuid?: string; // User UUID (string) to exclude
  currentUserRole?: string;
  role?: string;
  status?: string;
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
export class UserService extends BaseCrudService<UserEntity, CreateUserDto, UpdateUserDto, number> {
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
    private readonly auditLogService: AuditLogService,
  ) {
    super();
  }

  override async findAll(
    options: ExtendedFindAllOptions = {},
  ): Promise<PaginatedResult<UserEntity>> {
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
    const whereClause: Record<string, unknown> = {
      ...where,
      //status: { [Op.ne]: 'archived' }, // Exclude archived users from listing
    };

    if (options.excludeUserId) {
      whereClause.id = { [Op.ne]: options.excludeUserId }; // Exclude by ID (number)
    } else if (options.excludeUserUuid) {
      // Convert UUID to ID for exclusion
      const excludeUser = await this.userModel.findOne({
        where: { uuid: options.excludeUserUuid },
        attributes: ['id'],
      });
      if (excludeUser) {
        whereClause.id = { [Op.ne]: excludeUser.id };
      }
    }

    const { count, rows } = await this.userModel.findAndCountAll({
      where: whereClause,
      include: [
        { model: RoleEntity, attributes: ['id', 'role'] },
        { model: OrganizationEntity, attributes: ['id', 'name', 'slug'] },
      ],
      attributes: { exclude: ['password_hash'] },
      order:
        sortBy === 'last_login_at' ? [[sortBy, `${sortOrder} NULLS LAST`]] : [[sortBy, sortOrder]],
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

  override async findOne(
    id: number,
    options?: FindOptions<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { id, status: { [Op.ne]: 'archived' } },
      include: [
        { model: RoleEntity, attributes: ['id', 'uuid', 'role'] },
        { model: OrganizationEntity, attributes: ['id', 'uuid', 'name', 'slug'] },
      ],
      ...options,
      attributes: options?.attributes ? options.attributes : { exclude: ['password_hash'] },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { email: email.toLowerCase(), status: { [Op.ne]: 'archived' } },
      include: [RoleEntity],
    });
  }

  async findByInvitationToken(token: string): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { invitation_token: token },
      include: [RoleEntity],
    });
  }

  override async create(
    dto: CreateUserDto & {
      organizationId?: number;
      auth_provider?: AuthProvider;
      google_id?: string;
    },
    currentUser?: CurrentUser,
    options?: { transaction?: Transaction; auditContext?: AuditContext },
  ): Promise<UserEntity> {
    // Validate email uniqueness globally (across all organizations)
    await this.validateEmailUniqueness(dto.email, undefined, currentUser?.organizationId);

    // Validate organization
    // Handle both UUID (from currentUser) and ID (from dto)
    let organization: OrganizationEntity | null = null;
    if (currentUser?.organizationId) {
      // currentUser.organizationId is a UUID string
      organization = await this.organizationService.findByUuid(currentUser.organizationUuid);
    } else if (dto.organizationId) {
      // dto.organizationId is a number
      organization = await this.organizationService.findOne(
        dto.organizationId,
        options?.transaction,
      );
    }

    if (!organization || !organization.is_active) {
      throw new NotFoundException('Organization not found or inactive');
    }

    // Validate role
    const role = await this.roleService.findOne(dto.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Super admin users can only be created by super admin users
    if (currentUser && currentUser?.role !== Role.SUPER_ADMIN && role.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('You are not authorized to create a super admin user.');
    }

    // Determine if this is an invitation (no password provided)
    const isInvitation = !dto.password;
    const status = isInvitation && !dto.auth_provider ? 'invited' : 'active';

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (dto.password) {
      hashedPassword = await this.passwordService.hash(dto.password);
    }

    // Generate a secure invitation token for invited users
    const invitationToken = isInvitation && !dto.auth_provider
      ? this.passwordService.generateResetToken()
      : null;

    const createdUserResult = await this.userModel.create(
      {
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email.toLowerCase(),
        password_hash: hashedPassword,
        organization_id: dto.organizationId,
        role_id: dto.roleId,
        status,
        is_email_notifications_enabled: true,
        auth_provider: dto.auth_provider || AuthProvider.Email,
        google_id: dto.google_id || null,
        invitation_token: invitationToken,
      },
      {
        ...(options?.transaction && { transaction: options.transaction }),
      },
    );

    if (!createdUserResult) {
      throw new InternalServerErrorException('Failed to create user');
    }

    const createdUser = createdUserResult as UserEntity;

    // Reload user with relations if transaction is provided (to ensure we get the full entity)
    // Otherwise, the created user is already available
    let userWithRelations: UserEntity;
    if (options?.transaction) {
      // If we're in a transaction, reload with relations within the transaction
      userWithRelations = (await this.userModel.findByPk(createdUser.id, {
        include: [
          { model: RoleEntity, attributes: ['id', 'uuid', 'role'] },
          { model: OrganizationEntity, attributes: ['id', 'uuid', 'name', 'slug'] },
        ],
        attributes: { exclude: ['password_hash'] },
        transaction: options.transaction,
      })) as UserEntity;

      if (!userWithRelations) {
        throw new InternalServerErrorException('Failed to reload created user');
      }
    } else {
      // If no transaction, use findOne which will work normally
      const foundUser = await this.findOne(createdUser.id);
      if (!foundUser) {
        throw new InternalServerErrorException('Failed to find created user');
      }
      userWithRelations = foundUser;
    }

    // Send invitation email if invitation
    // Note: Welcome emails for active users should be sent by the calling service
    // (e.g., authService.register, authService.googleSignupComplete, userController.create)
    if (isInvitation && !dto.auth_provider) {
      const inviterName = currentUser
        ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
        : 'Administrator';

      const inviteLink = `${
        process.env.FRONTEND_DOMAIN || 'http://localhost:3000'
      }/auth/invitation?token=${invitationToken}`;

      this.mailService
        .sendInvitationEmail(userWithRelations.email, {
          name: userWithRelations.first_name,
          inviterName,
          organizationName: organization.name,
          inviteLink,
        })
        .catch(console.error);
    }

    // Audit: user.created
    if (options?.auditContext) {
      await this.auditLogService.log({
        action: AuditAction.USER_CREATED,
        target_user_id: userWithRelations.id,
        context: options.auditContext,
        new_value: {
          first_name: userWithRelations.first_name,
          last_name: userWithRelations.last_name,
          email: userWithRelations.email,
          organization_id: userWithRelations.organization_id,
          role_id: userWithRelations.role_id,
          status: userWithRelations.status,
        },
      });
    }
    return userWithRelations;
  }

  override async update(
    id: number,
    dto: UpdateUserDto,
    currentUser?: CurrentUser,
    options?: { transaction?: Transaction; auditContext?: AuditContext },
  ): Promise<UserEntity> {
    const user = await this.findOneOrThrow(id);
    const previousValue = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      organization_id: user.organization_id,
      role_id: user.role_id,
      status: user.status,
    };
    const previousRoleId = user.role_id;
    const previousStatus = user.status;
    const isEmailChanged = dto.email !== user.email;
    let auditAction: AuditAction = AuditAction.USER_UPDATED;

    // If status is being changed to archived, handle it as soft delete
    if (dto.status && dto.status === 'archived' && previousStatus !== 'archived') {
      auditAction = AuditAction.USER_ARCHIVED;
      // Update status to archived (soft delete)
      await user.update(
        { status: 'archived' },
        { ...(options?.transaction && { transaction: options.transaction }) },
      );
      // Logout user from all devices when archived
      await this.logoutUserFromAllDevices(user.uuid, options?.transaction);

      // Audit: user.archived
      if (options?.auditContext) {
        await this.auditLogService.log({
          action: auditAction,
          target_user_id: user.id,
          context: options.auditContext,
          previous_value: previousValue,
          new_value: {
            ...previousValue,
            status: 'archived',
          },
        });
      }

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

    // Determine specific audit action if status or role changed
    if (dto.status && dto.status !== previousStatus) {
      auditAction = AuditAction.USER_STATUS_CHANGED;
    } else if (dto.roleId && dto.roleId !== previousRoleId) {
      auditAction = AuditAction.USER_ROLE_CHANGED;
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

      // Prevent privilege escalation
      if (currentUser) {
        if (role.role === Role.SYSTEM_ADMIN) {
          throw new ForbiddenException('System admin role cannot be assigned.');
        }
        if (
          role.role === Role.SUPER_ADMIN &&
          currentUser.role !== Role.SUPER_ADMIN &&
          currentUser.role !== Role.SYSTEM_ADMIN
        ) {
          throw new ForbiddenException(
            'You are not authorized to assign the super admin role.',
          );
        }
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
    const statusChangedToInactive =
      dto.status && dto.status !== previousStatus && dto.status === 'inactive';
    const needsTransaction = (roleChanged || statusChangedToInactive) && !options?.transaction;

    // Use transaction if role/status changes and no transaction provided
    if (needsTransaction) {
      if (!this.userModel.sequelize) {
        throw new InternalServerErrorException('Sequelize instance not available');
      }
      const transaction = await this.userModel.sequelize.transaction();
      try {
        await user.update(updateData, { transaction });

        // If role changed, logout user from all devices (force re-login)
        if (roleChanged) {
          await this.logoutUserFromAllDevices(user.uuid, transaction);
        }

        // If status changed to inactive, logout user from all devices
        if (statusChangedToInactive) {
          await this.logoutUserFromAllDevices(user.uuid, transaction);
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      // No transaction needed or transaction already provided
      await user.update(updateData, {
        ...(options?.transaction && { transaction: options.transaction }),
      });

      // If role changed, logout user from all devices (force re-login)
      if (roleChanged) {
        await this.logoutUserFromAllDevices(user.uuid, options?.transaction);
      }

      // If status changed to inactive, logout user from all devices
      if (statusChangedToInactive) {
        await this.logoutUserFromAllDevices(user.uuid, options?.transaction);
      }
    }
    // Send invitation email if status is invited and email is changed
    if (isEmailChanged) this.sendInvitationEmailIfNeeded(user, dto, currentUser);

    const updatedUser = (await this.findOne(id)) as UserEntity;
    // Audit: user.updated
    if (options?.auditContext) {
      await this.auditLogService.log({
        action: auditAction,
        target_user_id: updatedUser.id,
        context: options.auditContext,
        previous_value: previousValue,
        new_value: {
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          email: updatedUser.email,
          organization_id: updatedUser.organization_id,
          role_id: updatedUser.role_id,
          status: updatedUser.status,
        },
      });
    }
    return updatedUser;
  }

  /**
   * Sends an invitation email if the user status is being set to 'invited'
   */
  private async sendInvitationEmailIfNeeded(
    user: UserEntity,
    dto: UpdateUserDto,
    currentUser?: CurrentUser,
  ): Promise<void> {
    if (dto.status === 'invited' && dto.email) {
      const organisation = await this.organizationService.findOne(user.organization_id);
      if (!organisation || !organisation.is_active) {
        throw new NotFoundException('Organization not found or inactive');
      }

      // Generate a new secure invitation token
      const newToken = this.passwordService.generateResetToken();
      await user.update({ invitation_token: newToken });

      const inviterName = currentUser
        ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
        : 'Administrator';
      const inviteLink = `${
        process.env.FRONTEND_DOMAIN || 'http://localhost:3000'
      }/auth/invitation?token=${newToken}`;

      this.mailService
        .sendInvitationEmail(user.email, {
          name: user.first_name,
          inviterName,
          organizationName: organisation.name,
          inviteLink,
        })
        .catch(console.error);
    }
  }

  override async softDelete(id: number, auditContext?: AuditContext): Promise<boolean> {
    const user = await this.findOneOrThrow(id);
    const previousStatus = user.status;
    await user.update({ status: 'archived' });
    // Logout user from all devices when deactivated
    await this.logoutUserFromAllDevices(user.uuid);
    // Audit: user.archived
    if (auditContext) {
      await this.auditLogService.log({
        action: AuditAction.USER_ARCHIVED,
        target_user_id: user.id,
        context: auditContext,
        previous_value: { status: previousStatus },
        new_value: { status: 'archived' },
      });
    }
    return true;
  }

  /**
   * Permanently delete an archived user record from database
   * Only callable for users with archived status
   */
  async hardDelete(id: number): Promise<boolean> {
    const user = await this.userModel.findOne({
      where: { id, status: 'archived' },
    });

    if (!user) {
      throw new NotFoundException('Archived user not found');
    }

    // Logout user from all devices before deletion
    await this.logoutUserFromAllDevices(user.uuid);

    // Permanently delete the user record
    await user.destroy({ force: true });
    return true;
  }

  override async restore(id: number, auditContext?: AuditContext): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { id, status: 'archived' },
    });

    if (!user) {
      throw new NotFoundException('User not found or not archived');
    }

    await user.update({ status: 'active' });

    // Audit: user.restored
    if (auditContext) {
      await this.auditLogService.log({
        action: AuditAction.USER_RESTORED,
        target_user_id: user.id,
        context: auditContext,
        previous_value: { status: 'archived' },
        new_value: { status: 'active' },
      });
    }
    return this.findOne(id) as Promise<UserEntity>;
  }

  async cancelInvitation(id: number): Promise<UserEntity> {
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

  async resendInvitation(id: number, currentUser?: CurrentUser): Promise<UserEntity> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'inactive') {
      throw new BadRequestException('User is not in inactive status');
    }

    // Generate a new secure invitation token and update status
    const newToken = this.passwordService.generateResetToken();
    await user.update({ status: 'invited', invitation_token: newToken });

    // Send invitation email
    const inviterName = currentUser
      ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
      : 'Administrator';
    const inviteLink = `${
      process.env.FRONTEND_DOMAIN || 'http://localhost:3000'
    }/auth/invitation?token=${newToken}`;
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
    organizationId: number,
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
    organizationUuid: string,
  ): Promise<UserEntity | null> {
    // First find organization by UUID to get its ID
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      return null;
    }

    return await this.userModel.findOne({
      where: { uuid, organization_id: organization.id },
      include: [
        { model: RoleEntity, attributes: ['id', 'uuid', 'role'] },
        { model: OrganizationEntity, attributes: ['id', 'uuid', 'name', 'slug'] },
      ],
      attributes: { exclude: ['password_hash'] },
    });
  }

  async searchUsers(
    organizationId: number,
    searchQuery: string,
    options: ExtendedFindAllOptions = {},
  ): Promise<PaginatedResult<UserEntity>> {
    const searchCondition = {
      [Op.or]: [
        { first_name: { [Op.iLike]: `%${searchQuery}%` } },
        { last_name: { [Op.iLike]: `%${searchQuery}%` } },
        { email: { [Op.iLike]: `%${searchQuery}%` } },
        Sequelize.where(
          Sequelize.fn(
            'CONCAT',
            Sequelize.col('first_name'),
            ' ',
            Sequelize.fn('COALESCE', Sequelize.col('last_name'), ''),
          ),
          { [Op.iLike]: `%${searchQuery}%` },
        ),
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

  private async findOneOrThrow(id: number): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { id, status: { [Op.ne]: 'archived' } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async validateEmailUniqueness(
    email: string,
    excludeId?: number,
    organization_id?: number,
  ): Promise<void> {
    // Email must be unique globally across all organizations (including archived users)
    const whereClause: Record<string, unknown> = {
      email: email.toLowerCase(),
    };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingUser = await this.userModel.findOne({ where: whereClause });

    if (existingUser && organization_id && existingUser.organization_id !== organization_id) {
      throw new ConflictException('Email already registered in another organization');
    }

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
  }

  /**
   * Get excluded roles based on current user's role for visibility filtering
   * Super Admin can see: Admin, Manager, Designer (exclude: super_admin)
   * Admin can see: Admin, Manager, Designer (exclude: super_admin)
   * Lower level users: exclude super_admin and admin (defense in depth)
   */
  private getExcludedRolesForVisibility(currentUserRole: string): string[] {
    const role = currentUserRole.toLowerCase();
    if (role === Role.SYSTEM_ADMIN) {
      // System Admin can see all roles
      return [];
    }
    if (role === Role.SUPER_ADMIN) {
      // Super Admin cannot see other Super Admins
      return [Role.SUPER_ADMIN];
    } else if (role === Role.ADMIN) {
      // Admin cannot see Super Admin, but can see other Admins
      return [Role.SUPER_ADMIN];
    } else {
      // Lower level users (manager, designer) cannot see Super Admin or Admin
      return [Role.SUPER_ADMIN, Role.ADMIN];
    }
  }

  /**
   * Get role IDs by role names
   */
  private async getRoleIdsByNames(roleNames: string[]): Promise<number[]> {
    const roles = await Promise.all(roleNames.map((name) => this.roleService.findByRole(name)));
    return roles
      .filter((r): r is NonNullable<typeof r> => r !== null && r !== undefined)
      .map((r) => r.id);
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
    let excludedRoleIds: number[] = [];
    if (options.currentUserRole) {
      const excludedRoles = this.getExcludedRolesForVisibility(options.currentUserRole);
      if (excludedRoles.length > 0) {
        excludedRoleIds = await this.getRoleIdsByNames(excludedRoles);
      }
    }

    if (options.status === 'active') {
      whereClause.status = { [Op.ne]: 'archived' };
    } else {
      whereClause.status = options.status;
    }

    // Handle role filtering - need to find role IDs first
    let roleIds: number[] | undefined;
    if (options.role) {
      const roleFilter = options.role.toLowerCase();
      // Admin filter should include both admin and super_admin
      if (roleFilter === 'admin') {
        const superAdminRole = await this.roleService.findByRole(Role.SUPER_ADMIN);
        const adminRole = await this.roleService.findByRole(Role.ADMIN);
        roleIds = [superAdminRole?.id, adminRole?.id].filter(Boolean) as number[];
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

    if (dto.first_name) updateData.first_name = dto.first_name;
    if (dto.last_name) updateData.last_name = dto.last_name;
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
    else if (dto.google_id === '') updateData.google_id = null;

    if (dto.auth_provider !== undefined) updateData.auth_provider = dto.auth_provider;

    // Handle last login timestamp
    if (dto.last_login_at !== undefined) updateData.last_login_at = dto.last_login_at;

    // Handle invitation token
    if (dto.invitation_token !== undefined) updateData.invitation_token = dto.invitation_token;

    return updateData;
  }

  private async logoutUserFromAllDevices(userId: string, transaction?: Transaction): Promise<void> {
    await this.sessionService.revokeAllForUser(userId, transaction);
  }
}
