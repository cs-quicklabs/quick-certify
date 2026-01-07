import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, ModelStatic, FindOptions, Op } from 'sequelize';
import { BaseCrudServiceInterface, FindAllOptions, PaginatedResult } from './interfaces';

@Injectable()
export abstract class BaseCrudService<
  T extends Model,
  CreateDto extends Record<string, unknown>,
  UpdateDto extends Record<string, unknown>,
> implements BaseCrudServiceInterface<T, CreateDto, UpdateDto>
{
  protected abstract readonly model: ModelStatic<T>;
  protected readonly entityName: string = 'Entity';

  // Override these in child classes if needed
  protected readonly defaultSortField: string = 'createdAt';
  protected readonly defaultSortOrder: 'ASC' | 'DESC' = 'DESC';
  protected readonly defaultLimit: number = 10;
  protected readonly maxLimit: number = 100;
  protected readonly softDeleteField: string = 'deleted_at';

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

    const findOptions: FindOptions = {
      where: {
        ...where,
        [this.softDeleteField]: null,
      },
      order: [[sortBy, sortOrder]],
      limit: safeLimit,
      offset,
    };

    if (include.length > 0) {
      findOptions.include = include;
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

  async findOne(id: number, options: FindOptions = {}): Promise<T | null> {
    const entity = await this.model.findOne({
      where: {
        id,
        [this.softDeleteField]: null,
        ...options.where,
      },
      ...options,
    });

    return entity;
  }

  async findOneOrFail(id: number, options: FindOptions = {}): Promise<T> {
    const entity = await this.findOne(id, options);

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }

    return entity;
  }

  async findByUuid(uuid: string, options: FindOptions = {}): Promise<T | null> {
    const entity = await this.model.findOne({
      where: {
        uuid,
        [this.softDeleteField]: null,
        ...options.where,
      },
      ...options,
    });

    return entity;
  }

  async findByUuidOrFail(uuid: string, options: FindOptions = {}): Promise<T> {
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

  async update(id: number, dto: UpdateDto): Promise<T> {
    const entity = await this.findOneOrFail(id);

    await entity.update(dto as Record<string, unknown>);

    return entity;
  }

  async updateByUuid(uuid: string, dto: UpdateDto): Promise<T> {
    const entity = await this.findByUuidOrFail(uuid);

    await entity.update(dto as Record<string, unknown>);

    return entity;
  }

  async delete(id: number): Promise<boolean> {
    const entity = await this.findOneOrFail(id);
    await entity.destroy();
    return true;
  }

  async softDelete(id: number): Promise<boolean> {
    const entity = await this.findOneOrFail(id);
    await entity.update({ [this.softDeleteField]: new Date() } as Record<string, unknown>);
    return true;
  }

  async restore(id: number): Promise<T> {
    const entity = await this.model.findOne({
      where: {
        id,
        [this.softDeleteField]: { [Op.ne]: null },
      },
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found or not deleted`);
    }

    await entity.update({ [this.softDeleteField]: null } as Record<string, unknown>);

    return entity;
  }

  async count(where: Record<string, unknown> = {}): Promise<number> {
    return this.model.count({
      where: {
        ...where,
        [this.softDeleteField]: null,
      },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.model.count({
      where: {
        id,
        [this.softDeleteField]: null,
      },
    });
    return count > 0;
  }

  async existsByUuid(uuid: string): Promise<boolean> {
    const count = await this.model.count({
      where: {
        uuid,
        [this.softDeleteField]: null,
      },
    });
    return count > 0;
  }

  // Multi-tenant helper methods
  async findAllByOrganization(
    organizationId: number,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<T>> {
    return this.findAll({
      ...options,
      where: {
        ...options.where,
        organization_id: organizationId,
      },
    });
  }

  async findOneByOrganization(
    id: number,
    organizationId: number,
    options: FindOptions = {},
  ): Promise<T | null> {
    return this.findOne(id, {
      ...options,
      where: {
        ...options.where,
        organization_id: organizationId,
      },
    });
  }

  async findOneByOrganizationOrFail(
    id: number,
    organizationId: number,
    options: FindOptions = {},
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
