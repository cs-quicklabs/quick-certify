import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, ModelStatic, Op } from 'sequelize';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { FindAllOptions, PaginatedResult } from './interfaces';

export interface NamedEntity {
  id: number;
  uuid: string;
  name: string;
  is_active: boolean;
  organization_id: number;
}

/**
 * Base service for organization-scoped named entities with is_active soft delete.
 *
 * Consolidates: case-insensitive unique name per org, soft delete via is_active,
 * auto-restoration of soft-deleted records on re-create.
 *
 * Used by: EventTypeService, EventLevelService, EventFormatService
 */
@Injectable()
export abstract class BaseNamedEntityService<
  T extends Model & NamedEntity,
  CreateDto extends { name: string },
  UpdateDto extends { name?: string },
> {
  protected abstract readonly model: ModelStatic<T>;
  protected abstract readonly entityName: string;

  constructor(protected readonly organizationService: OrganizationService) {}

  async findAll(
    organizationUuid: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'ASC', where = {} } = options;

    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      };
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const whereClause: Record<string, unknown> = {
      organization_id: organization.id,
      is_active: true,
      ...where,
    };

    const { count, rows } = await this.model.findAndCountAll({
      where: whereClause,
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

  async findByUuid(uuid: string, organizationUuid: string): Promise<T | null> {
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) return null;

    const whereClause: Record<string, unknown> = {
      uuid,
      organization_id: organization.id,
      is_active: true,
    };

    return this.model.findOne({ where: whereClause });
  }

  async create(organizationUuid: string, dto: CreateDto): Promise<T> {
    const organization = await this.organizationService.findByUuidOrFail(organizationUuid);
    const normalizedName = dto.name.trim();

    const whereClause: Record<string, unknown> = {
      organization_id: organization.id,
      name: { [Op.iLike]: normalizedName },
    };

    const existing = await this.model.findOne({ where: whereClause });

    if (existing) {
      if (!existing.is_active) {
        await existing.update({ is_active: true });
        return existing.reload();
      }
      throw new ConflictException(`${this.entityName} "${normalizedName}" already exists`);
    }

    return this.model.create({
      organization_id: organization.id,
      name: normalizedName,
      is_active: true,
    } as unknown as T['_creationAttributes']);
  }

  async updateByUuid(uuid: string, organizationUuid: string, dto: UpdateDto): Promise<T> {
    const entity = await this.findByUuidOrFail(uuid, organizationUuid);

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();

      const whereClause: Record<string, unknown> = {
        organization_id: entity.organization_id,
        name: { [Op.iLike]: normalizedName },
        id: { [Op.ne]: entity.id },
      };

      const existing = await this.model.findOne({ where: whereClause });

      if (existing) {
        throw new ConflictException(`${this.entityName} "${normalizedName}" already exists`);
      }

      await entity.update({ name: normalizedName });
    }

    return entity;
  }

  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const entity = await this.findByUuidOrFail(uuid, organizationUuid);
    await entity.update({ is_active: false });
    return true;
  }

  private async findByUuidOrFail(uuid: string, organizationUuid: string): Promise<T> {
    const entity = await this.findByUuid(uuid, organizationUuid);
    if (!entity) throw new NotFoundException(`${this.entityName} not found`);
    return entity;
  }
}
