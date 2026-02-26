import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  PathwayEntity,
  DesignEntity,
  RecipientEntity,
  OrganizationEntity,
  EventEntity,
} from '@src/entities';
import { CreatePathwayDto, UpdatePathwayDto } from './dtos';
import { PaginatedResult } from '@src/commons/base';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { PathwayEventService } from './pathway-event.service';
import { escapeLikePattern } from '@src/commons/utils';
import { IPathwayService } from './interfaces';

const DEFAULT_PATHWAY_INCLUDES = [
  {
    model: EventEntity,
    as: 'events',
    required: false,
    through: { attributes: ['order', 'is_final'], as: 'pathway_event' },
    include: [{ model: DesignEntity, as: 'design', required: false }],
  },
  {
    model: RecipientEntity,
    as: 'participants',
    required: false,
    through: { attributes: ['status'], as: 'pathway_participant' },
  },
];

@Injectable()
export class PathwayService implements IPathwayService {
  constructor(
    @InjectModel(PathwayEntity)
    private readonly pathwayModel: typeof PathwayEntity,
    private readonly sequelize: Sequelize,
    private readonly pathwayEventService: PathwayEventService,
    private readonly organizationService: OrganizationService,
  ) {}

  async findAll(
    organizationUuid: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {},
  ): Promise<PaginatedResult<PathwayEntity>> {
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      return this.emptyPaginatedResult(filters.limit || 10);
    }

    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', search } = filters;

    const allowedSortColumns = ['created_at', 'name', 'status'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const queryWhere: WhereOptions<PathwayEntity> = {
      organization_id: organization.id,
      is_active: true,
    };

    if (filters.status) {
      queryWhere.status = filters.status;
    }

    if (search?.trim()) {
      queryWhere.name = { [Op.iLike]: `%${escapeLikePattern(search.trim())}%` };
    }

    const { count, rows } = await this.pathwayModel.findAndCountAll({
      where: queryWhere,
      include: DEFAULT_PATHWAY_INCLUDES,
      distinct: true,
      order: [[safeSortBy, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
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

  async findByUuid(uuid: string, organizationUuid: string): Promise<PathwayEntity | null> {
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) return null;

    return this.pathwayModel.findOne({
      where: {
        uuid,
        organization_id: organization.id,
        is_active: true,
      },
      include: DEFAULT_PATHWAY_INCLUDES,
    });
  }

  async create(organizationUuid: string, dto: CreatePathwayDto): Promise<PathwayEntity> {
    const organization = await this.requireOrganization(organizationUuid);
    const normalizedName = dto.name.trim();

    // Check for existing pathway with same name
    const existing = await this.pathwayModel.findOne({
      where: {
        organization_id: organization.id,
        name: { [Op.iLike]: normalizedName },
      },
    });

    if (existing) {
      if (existing.is_active) {
        throw new ConflictException(
          `Pathway "${normalizedName}" already exists in this organization`,
        );
      }
      // Restore soft-deleted pathway
      return this.restorePathway(existing, dto, organization);
    }

    const transaction = await this.sequelize.transaction();
    let pathwayUuid: string;

    try {
      const pathway = await this.pathwayModel.create(
        {
          organization_id: organization.id,
          name: normalizedName,
          description: dto.description ?? null,
          banner_url: dto.bannerUrl ?? null,
          status: dto.status ?? 'draft',
          is_active: true,
        },
        { transaction },
      );

      if (dto.events?.length) {
        await this.pathwayEventService.syncEvents(
          pathway,
          dto.events,
          organization.id,
          transaction,
        );
      }

      pathwayUuid = pathway.uuid;
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return this.requirePathway(pathwayUuid, organizationUuid);
  }

  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdatePathwayDto,
  ): Promise<PathwayEntity> {
    const pathway = await this.requirePathway(uuid, organizationUuid);
    const organization = await this.requireOrganization(organizationUuid);

    const updateData: Partial<PathwayEntity> = {};

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();
      const duplicate = await this.pathwayModel.findOne({
        where: {
          organization_id: organization.id,
          name: { [Op.iLike]: normalizedName },
          id: { [Op.ne]: pathway.id },
          is_active: true,
        },
      });
      if (duplicate) {
        throw new ConflictException(
          `Pathway "${normalizedName}" already exists in this organization`,
        );
      }
      updateData.name = normalizedName;
    }

    if (dto.description !== undefined) updateData.description = dto.description ?? null;
    if (dto.bannerUrl !== undefined) updateData.banner_url = dto.bannerUrl ?? null;
    if (dto.status !== undefined) updateData.status = dto.status;

    const transaction = await this.sequelize.transaction();

    try {
      await pathway.update(updateData, { transaction });

      if (dto.events !== undefined) {
        await this.pathwayEventService.syncEvents(
          pathway,
          dto.events,
          organization.id,
          transaction,
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return this.requirePathway(uuid, organizationUuid);
  }

  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const pathway = await this.requirePathway(uuid, organizationUuid);
    await pathway.update({ is_active: false });
    return true;
  }

  // ─── Public (unauthenticated) methods ───

  /**
   * List active pathways for an organization identified by slug.
   * Used by public pages – no auth required.
   */
  async findAllPublic(
    slug: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {},
  ): Promise<PaginatedResult<PathwayEntity>> {
    const organization = await this.organizationService.findBySlug(slug);
    if (!organization) return this.emptyPaginatedResult(filters.limit || 10);

    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', search } = filters;

    const allowedSortColumns = ['created_at', 'name'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const queryWhere: WhereOptions<PathwayEntity> = {
      organization_id: organization.id,
      is_active: true,
      status: 'active',
    };

    if (search?.trim()) {
      queryWhere.name = { [Op.iLike]: `%${escapeLikePattern(search.trim())}%` };
    }

    const { count, rows } = await this.pathwayModel.findAndCountAll({
      where: queryWhere,
      include: DEFAULT_PATHWAY_INCLUDES,
      distinct: true,
      order: [[safeSortBy, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
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

  /**
   * Get a single active pathway by UUID under the given org slug.
   * Used by public pages – no auth required.
   */
  async findOnePublic(slug: string, pathwayUuid: string): Promise<PathwayEntity | null> {
    const organization = await this.organizationService.findBySlug(slug);
    if (!organization) return null;

    return this.pathwayModel.findOne({
      where: {
        uuid: pathwayUuid,
        organization_id: organization.id,
        is_active: true,
        status: 'active',
      },
      include: DEFAULT_PATHWAY_INCLUDES,
    });
  }

  // ─── Private helpers ───

  private async requireOrganization(uuid: string) {
    const org = await this.organizationService.findByUuid(uuid);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async requirePathway(uuid: string, organizationUuid: string): Promise<PathwayEntity> {
    const pathway = await this.findByUuid(uuid, organizationUuid);
    if (!pathway) throw new NotFoundException('Pathway not found');
    return pathway;
  }

  private async restorePathway(
    existing: PathwayEntity,
    dto: CreatePathwayDto,
    organization: OrganizationEntity,
  ): Promise<PathwayEntity> {
    const transaction = await this.sequelize.transaction();

    try {
      const updateData: Partial<PathwayEntity> = {
        is_active: true,
        name: dto.name.trim(),
      };

      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.bannerUrl !== undefined) updateData.banner_url = dto.bannerUrl;
      if (dto.status !== undefined) updateData.status = dto.status;

      await existing.update(updateData, { transaction });

      if (dto.events?.length) {
        await this.pathwayEventService.syncEvents(
          existing,
          dto.events,
          organization.id,
          transaction,
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return this.requirePathway(existing.uuid, organization.uuid);
  }

  private emptyPaginatedResult(limit: number): PaginatedResult<PathwayEntity> {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}
