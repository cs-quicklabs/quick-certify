import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { UserEntity, UserTypeEntity, OrganizationEntity } from '@src/entities';
import { PasswordService } from '@src/modules/auth/services';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { CurrentUser } from '../auth/interfaces';
import { UserTypeEnum } from '@src/commons/enums';
import { EmailService } from '@src/commons/services';

/**
 * User Service
 *
 * Extends BaseCrudService following DRY
 * DIP: Uses PasswordService for password operations
 * SRP: Manages user CRUD only
 */
@Injectable()
export class UserService extends BaseCrudService<UserEntity, CreateUserDto, UpdateUserDto> {
  protected readonly model = UserEntity;
  protected override readonly entityName = 'User';

  constructor(
    @InjectModel(UserEntity)
    private readonly userModel: typeof UserEntity,
    @InjectModel(UserTypeEntity)
    private readonly userTypeModel: typeof UserTypeEntity,
    @InjectModel(OrganizationEntity)
    private readonly organizationModel: typeof OrganizationEntity,
    private readonly passwordService: PasswordService,
    private readonly mailService: EmailService,
  ) {
    super();
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<UserEntity>> {
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
        deleted_at: null,
      },
      include: [
        { model: UserTypeEntity, attributes: ['id', 'name', 'code'] },
        { model: OrganizationEntity, attributes: ['id', 'uuid', 'name'] },
      ],
      attributes: { exclude: ['password'] },
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

  async findOne(id: number): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { id, deleted_at: null },
      include: [
        { model: UserTypeEntity, attributes: ['id', 'name', 'code'] },
        { model: OrganizationEntity, attributes: ['id', 'uuid', 'name'] },
      ],
      attributes: { exclude: ['password'] },
    });
  }

  async findByUuid(uuid: string, organizationId?: number): Promise<UserEntity | null> {
    const whereClause: Record<string, unknown> = { uuid, deleted_at: null };
    if (organizationId) {
      whereClause.organization_id = organizationId;
    }
    return this.userModel.findOne({
      where: whereClause,
      include: [
        { model: UserTypeEntity, attributes: ['id', 'name', 'code'] },
        { model: OrganizationEntity, attributes: ['id', 'uuid', 'name'] },
      ],
      attributes: { exclude: ['password'] },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userModel.findOne({
      where: { email: email.toLowerCase(), deleted_at: null },
      include: [UserTypeEntity],
    });
  }

  async create(dto: CreateUserDto, currentUser?: CurrentUser): Promise<UserEntity> {
    // Validate email uniqueness
    await this.validateEmailUniqueness(dto.email);

    // Validate organization
    await this.validateOrganization(dto.organizationId);

    // Validate user type
    const userType = await this.validateUserType(dto.userTypeId);

    // Super admin users can only be created by super admin users
    if (
      currentUser?.userTypeCode !== UserTypeEnum.SUPER_ADMIN &&
      userType.code === UserTypeEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You are not authorized to create a super admin user.');
    }

    // Hash password using injected service (DIP)
    const hashedPassword = await this.passwordService.hash(dto.password);

    const user = await this.userModel.create({
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email.toLowerCase(),
      phone: dto.phone || null,
      password: hashedPassword,
      gender: dto.gender || null,
      profile_picture: dto.profilePicture || null,
      organization_id: dto.organizationId,
      user_type_id: dto.userTypeId,
    });

    // Send welcome email (fire and forget)
    this.mailService.sendWelcomeEmail(user.email, { name: user.first_name }).catch(console.error);

    return this.findOne(user.id) as Promise<UserEntity>;
  }

  override async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOneOrThrow(id);

    // Validate email if changing
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      await this.validateEmailUniqueness(dto.email, id);
    }

    // Validate user type if changing
    if (dto.user_type_id) {
      await this.validateUserType(dto.user_type_id);
    }

    const updateData = this.buildUpdateData(dto);
    await user.update(updateData);

    return this.findOne(id) as Promise<UserEntity>;
  }

  async softDelete(id: number): Promise<boolean> {
    const user = await this.findOneOrThrow(id);
    await user.update({ deleted_at: new Date() });
    return true;
  }

  async restore(id: number): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { id, deleted_at: { [Op.ne]: null } },
    });

    if (!user) {
      throw new NotFoundException('User not found or not deleted');
    }

    await user.update({ deleted_at: null });
    return this.findOne(id) as Promise<UserEntity>;
  }

  // Multi-tenant methods
  async findAllByOrganization(
    organizationId: number,
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
        { model: UserTypeEntity, attributes: ['id', 'name', 'code'] },
        { model: OrganizationEntity, attributes: ['id', 'uuid', 'name'] },
      ],
      attributes: { exclude: ['password'] },
    });
  }

  async searchUsers(
    organizationId: number,
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

  private async findOneOrThrow(id: number): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async validateEmailUniqueness(email: string, excludeId?: number): Promise<void> {
    const whereClause: Record<string, unknown> = {
      email: email.toLowerCase(),
      deleted_at: null,
    };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingUser = await this.userModel.findOne({ where: whereClause });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
  }

  private async validateOrganization(organizationId: number): Promise<void> {
    const organization = await this.organizationModel.findByPk(organizationId);
    if (!organization || organization.deleted_at) {
      throw new NotFoundException('Organization not found');
    }
  }

  private async validateUserType(userTypeId: number): Promise<UserTypeEntity> {
    const userType = await this.userTypeModel.findByPk(userTypeId);
    if (!userType || !userType.is_active) {
      throw new NotFoundException('User type not found or inactive');
    }
    return userType;
  }

  private buildUpdateData(dto: UpdateUserDto): Partial<UserEntity> {
    const updateData: Partial<UserEntity> = {};

    if (dto.first_name) updateData.first_name = dto.first_name;
    if (dto.last_name) updateData.last_name = dto.last_name;
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.profile_picture !== undefined) updateData.profile_picture = dto.profile_picture;
    if (dto.user_type_id) updateData.user_type_id = dto.user_type_id;
    if (dto.is_notifications_enabled !== undefined)
      updateData.is_notifications_enabled = dto.is_notifications_enabled;

    return updateData;
  }
}
