import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { UserTypeEntity } from '@src/entities';
import { CreateUserTypeDto, UpdateUserTypeDto } from './dtos';

/**
 * User Type Service
 *
 * SRP: Manages user types/roles
 * Note: Does not extend BaseCrudService as user types have different behavior
 * (no soft delete, system code protection)
 */
@Injectable()
export class UserTypeService {
  // System codes that cannot be deleted or deactivated
  private readonly systemCodes = ['SUPER_ADMIN', 'ADMIN', 'USER'] as const;

  constructor(
    @InjectModel(UserTypeEntity)
    private readonly userTypeModel: typeof UserTypeEntity,
  ) {}

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<UserTypeEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', where = {} } = options;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.userTypeModel.findAndCountAll({
      where,
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

  async findAllActive(): Promise<UserTypeEntity[]> {
    return this.userTypeModel.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number): Promise<UserTypeEntity | null> {
    return this.userTypeModel.findByPk(id);
  }

  async findByCode(code: string): Promise<UserTypeEntity | null> {
    return this.userTypeModel.findOne({
      where: { code: code.toUpperCase() },
    });
  }

  async create(dto: CreateUserTypeDto): Promise<UserTypeEntity> {
    // Check for duplicate code
    const existingUserType = await this.userTypeModel.findOne({
      where: { code: dto.code.toUpperCase() },
    });

    if (existingUserType) {
      throw new ConflictException(`User type with code "${dto.code}" already exists`);
    }

    return this.userTypeModel.create({
      name: dto.name,
      code: dto.code.toUpperCase(),
      description: dto.description || null,
      is_active: dto.isActive ?? true,
    });
  }

  async update(id: number, dto: UpdateUserTypeDto): Promise<UserTypeEntity> {
    const userType = await this.requireById(id);

    const updateData: Partial<UserTypeEntity> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    await userType.update(updateData);
    return userType;
  }

  async delete(id: number): Promise<boolean> {
    const userType = await this.requireById(id);

    this.validateNotSystemCode(userType.code, 'Cannot delete system user types');

    await userType.destroy();
    return true;
  }

  async toggleActive(id: number): Promise<UserTypeEntity> {
    const userType = await this.requireById(id);

    // Can't deactivate system types that are currently active
    if (this.isSystemCode(userType.code) && userType.is_active) {
      throw new ConflictException('Cannot deactivate system user types');
    }

    await userType.update({ is_active: !userType.is_active });
    return userType;
  }

  async searchUserTypes(
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<UserTypeEntity>> {
    const searchCondition = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { code: { [Op.iLike]: `%${searchQuery}%` } },
        { description: { [Op.iLike]: `%${searchQuery}%` } },
      ],
    };

    return this.findAll({
      ...options,
      where: {
        ...options.where,
        ...searchCondition,
      },
    });
  }

  // Private helper methods

  private async requireById(id: number): Promise<UserTypeEntity> {
    const userType = await this.userTypeModel.findByPk(id);
    if (!userType) {
      throw new NotFoundException('User type not found');
    }
    return userType;
  }

  private isSystemCode(code: string): boolean {
    return this.systemCodes.includes(code as (typeof this.systemCodes)[number]);
  }

  private validateNotSystemCode(code: string, message: string): void {
    if (this.isSystemCode(code)) {
      throw new ConflictException(message);
    }
  }
}
