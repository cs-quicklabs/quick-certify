import {
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
import { UserTypeEnum } from '@src/commons/enums';
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
        status: { [Op.ne]: 'archived' },
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

  async create(dto: CreateUserDto, currentUser?: CurrentUser): Promise<UserEntity> {
    // Check if email belongs to a deactivated/archived user
    await this.validateEmailNotDeactivated(dto.email);

    // Validate email uniqueness
    await this.validateEmailUniqueness(dto.email);

    // Validate organization
    await this.validateOrganization(dto.organizationId);

    // Validate role
    const role = await this.validateRole(dto.roleId);

    // Super admin users can only be created by super admin users
    if (currentUser?.role !== Role.SUPER_ADMIN && role.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('You are not authorized to create a super admin user.');
    }

    // Hash password using injected service (DIP)
    const hashedPassword = await this.passwordService.hash(dto.password);

    const user = await this.userModel.create({
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email.toLowerCase(),
      password_hash: hashedPassword,
      organization_id: dto.organizationId,
      role_id: dto.roleId,
      status: 'active',
      email_notifications: true,
    });

    // Send welcome email (fire and forget)
    this.mailService.sendWelcomeEmail(user.email, { name: user.first_name }).catch(console.error);

    return this.findOne(user.id) as Promise<UserEntity>;
  }

  override async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOneOrThrow(id);
    const previousRoleId = user.role_id;

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

  // Multi-tenant methods
  override async findAllByOrganization(
    organizationId: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<UserEntity>> {
    return this.findAll({
      ...options,
      where: {
        ...options.where,
        organization_id: organizationId,
      },
    });
  }

  async findOneByUuidAndOrganization(
    uuid: string,
    organizationId: number,
  ): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { uuid, organization_id: organizationId, deleted_at: null },
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

    return this.findAll({
      ...options,
      where: {
        ...options.where,
        organization_id: organizationId,
        ...searchCondition,
      },
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

  private async validateEmailNotDeactivated(email: string): Promise<void> {
    const existingUser = await this.userModel.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (
      existingUser &&
      (existingUser.status === 'archived' || existingUser.status === 'inactive')
    ) {
      throw new ConflictException(
        'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
      );
    }
  }

  private async validateEmailUniqueness(email: string, excludeId?: string): Promise<void> {
    const whereClause: Record<string, unknown> = {
      email: email.toLowerCase(),
      status: { [Op.ne]: 'archived' },
    };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingUser = await this.userModel.findOne({ where: whereClause });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
  }

  private async validateOrganization(organizationId: string): Promise<void> {
    const organization = await this.organizationModel.findByPk(organizationId);
    if (!organization || !organization.is_active) {
      throw new NotFoundException('Organization not found or inactive');
    }
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
    if (dto.profile_picture !== undefined) updateData.profile_picture = dto.profile_picture;
    if (dto.is_notifications_enabled !== undefined)
      updateData.is_notifications_enabled = dto.is_notifications_enabled;
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase();
    if (dto.roleId !== undefined) updateData.role_id = dto.roleId;

    return updateData;
  }

  private async logoutUserFromAllDevices(userId: string): Promise<void> {
    await this.sessionService.revokeAllForUser(userId);
  }
}
