import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, ModelStatic, FindOptions, Includeable, WhereOptions, Op } from 'sequelize';
import { BaseCrudServiceInterface, FindAllOptions, PaginatedResult } from './interfaces';

@Injectable()
export abstract class BaseCrudService<
  T extends Model,
  CreateDto extends object,
  UpdateDto extends object,
  TId extends number | string = number,
> implements BaseCrudServiceInterface<T, CreateDto, UpdateDto> {
  protected abstract readonly model: ModelStatic<T>;
  protected readonly entityName: string = 'Entity';

  // Override these in child classes if needed
  protected readonly defaultSortField: string = 'createdAt';
  protected readonly defaultSortOrder: 'ASC' | 'DESC' = 'DESC';
  protected readonly defaultLimit: number = 10;
  protected readonly maxLimit: number = 100;
  protected readonly softDeleteField: string | null = 'deleted_at'; // null to disable soft delete filtering

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = this.defaultLimit,
      sortBy = this.defaultSortField,
      sortOrder = this.defaultSortOrder,
      where = {},
      include = [],
      attributes,
    } = options;

    const safeLimit = Math.min(Math.max(1, limit), this.maxLimit);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const findOptionsWhere: WhereOptions<T> = {
      ...where,
    } as WhereOptions<T>;

    // Only add soft delete filter if softDeleteField is configured
    if (this.softDeleteField) {
      (findOptionsWhere as Record<string, unknown>)[this.softDeleteField] = null;
    }

    const findOptions: FindOptions<T> = {
      where: findOptionsWhere,
      order: [[sortBy, sortOrder]] as unknown as [string, string],
      limit: safeLimit,
      offset,
    };

    if (include.length > 0) {
      findOptions.include = include as Includeable[];
    }

    if (attributes) {
      findOptions.attributes = attributes;
    }

    const { count, rows } = await this.model.findAndCountAll(findOptions);

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

  async findOne(id: TId, options: FindOptions<T> = {}): Promise<T | null> {
    const whereClause: Record<string, unknown> = {
      id: id as unknown as number,
      ...(options.where || {}),
    };

    // Only add soft delete filter if softDeleteField is configured
    if (this.softDeleteField) {
      whereClause[this.softDeleteField] = null;
    }

    const entity = await this.model.findOne({
      where: whereClause as WhereOptions<T>,
      ...options,
    });

    return entity;
  }

  async findOneOrFail(id: TId, options: FindOptions<T> = {}): Promise<T> {
    const whereClause: Record<string, unknown> = {
      id: id as unknown as number,
      ...(options.where || {}),
    };

    // Only add soft delete filter if softDeleteField is configured
    if (this.softDeleteField) {
      whereClause[this.softDeleteField] = null;
    }

    const entity = await this.model.findOne({
      where: whereClause as WhereOptions<T>,
      ...options,
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }

    return entity;
  }

  async findByUuid(uuid: string, options: FindOptions<T> = {}): Promise<T | null> {
    const whereClause: Record<string, unknown> = {
      uuid,
      ...(options.where || {}),
    };

    // Only add soft delete filter if softDeleteField is configured
    if (this.softDeleteField) {
      whereClause[this.softDeleteField] = null;
    }

    const entity = await this.model.findOne({
      where: whereClause as WhereOptions<T>,
      ...options,
    });

    return entity;
  }

  async findByUuidOrFail(uuid: string, options: FindOptions<T> = {}): Promise<T> {
    const entity = await this.findByUuid(uuid, options);

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with UUID ${uuid} not found`);
    }

    return entity;
  }

  async create(dto: CreateDto): Promise<T> {
    const entity = await this.model.create(dto as unknown as T['_creationAttributes']);
    return entity;
  }

  async update(id: TId, dto: UpdateDto): Promise<T> {
    const entity = await this.findOneOrFail(id);

    await entity.update(dto as Record<string, unknown>);

    return entity;
  }

  async updateByUuid(uuid: string, dto: UpdateDto): Promise<T> {
    const entity = await this.findByUuidOrFail(uuid);

    await entity.update(dto as Record<string, unknown>);

    return entity;
  }

  async delete(id: TId): Promise<boolean> {
    const entity = await this.findOneOrFail(id);
    await entity.destroy();
    return true;
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const entity = await this.findByUuidOrFail(uuid);
    await entity.destroy();
    return true;
  }

  async softDelete(id: TId): Promise<boolean> {
    if (!this.softDeleteField) {
      throw new Error(
        `Soft delete is not configured for ${this.entityName}. Set softDeleteField property.`,
      );
    }
    const entity = await this.findOneOrFail(id);
    await entity.update({ [this.softDeleteField]: new Date() } as Record<string, unknown>);
    return true;
  }

  async softDeleteByUuid(uuid: string): Promise<boolean> {
    if (!this.softDeleteField) {
      throw new Error(
        `Soft delete is not configured for ${this.entityName}. Set softDeleteField property.`,
      );
    }
    const entity = await this.findByUuidOrFail(uuid);
    await entity.update({ [this.softDeleteField]: new Date() } as Record<string, unknown>);
    return true;
  }

  async restore(id: TId): Promise<T> {
    if (!this.softDeleteField) {
      throw new Error(
        `Soft delete is not configured for ${this.entityName}. Set softDeleteField property.`,
      );
    }
    const whereClause: Record<string, unknown> = {
      id: id as unknown as number,
      [this.softDeleteField]: { [Op.ne]: null },
    };

    const entity = await this.model.findOne({
      where: whereClause as WhereOptions<T>,
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found or not deleted`);
    }

    await entity.update({ [this.softDeleteField]: null } as Record<string, unknown>);

    return entity;
  }

  async count(where: Record<string, unknown> = {}): Promise<number> {
    const whereClause: WhereOptions<T> = {
      ...where,
    } as WhereOptions<T>;

    // Only add soft delete filter if softDeleteField is configured
    if (this.softDeleteField) {
      (whereClause as Record<string, unknown>)[this.softDeleteField] = null;
    }

    const result = await this.model.count({
      where: whereClause,
    });
    return typeof result === 'number' ? result : 0;
  }

  async exists(id: TId): Promise<boolean> {
    const whereClause: Record<string, unknown> = {
      id: id as unknown as number,
    };

    // Only add soft delete filter if softDeleteField is configured
    if (this.softDeleteField) {
      whereClause[this.softDeleteField] = null;
    }

    const result = await this.model.count({
      where: whereClause as WhereOptions<T>,
    });
    const count = typeof result === 'number' ? result : 0;
    return count > 0;
  }

  async existsByUuid(uuid: string): Promise<boolean> {
    const whereClause: Record<string, unknown> = {
      uuid,
    };

    // Only add soft delete filter if softDeleteField is configured
    if (this.softDeleteField) {
      whereClause[this.softDeleteField] = null;
    }

    const result = await this.model.count({
      where: whereClause as WhereOptions<T>,
    });
    const count = typeof result === 'number' ? result : 0;
    return count > 0;
  }

  // Multi-tenant helper methods
  async findAllByOrganization(
    organizationId: TId,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<T>> {
    return this.findAll({
      ...options,
      where: {
        ...options.where,
        organization_id: organizationId,
      } as Record<string, unknown>,
    });
  }

  async findOneByOrganization(
    id: TId,
    organizationId: TId,
    options: FindOptions<T> = {},
  ): Promise<T | null> {
    return this.findOne(id, {
      ...options,
      where: {
        ...options.where,
        organization_id: organizationId,
      },
    } as unknown as FindOptions<T>);
  }

  async findOneByOrganizationOrFail(
    id: TId,
    organizationId: TId,
    options: FindOptions<T> = {},
  ): Promise<T> {
    const entity = await this.findOneByOrganization(id, organizationId, options);

    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} with ID ${id} not found in this organization`,
      );
    }

    return entity;
  }
}
