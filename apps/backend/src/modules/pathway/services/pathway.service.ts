import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { PathwayEntity } from '@src/entities/pathway.entity';
import { EventEntity } from '@src/entities/event.entity';
import { DesignEntity } from '@src/entities/design.entity';
import { RecipientEntity } from '@src/entities/recipient.entity';
import { PathwayEventEntity } from '@src/entities/pathway-event.entity';
import { PathwayParticipantEntity } from '@src/entities/pathway-participant.entity';
import { CreatePathwayDto, UpdatePathwayDto } from '../dtos';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { PathwayEventService } from './pathway-event.service';

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
export class PathwayService {
  constructor(
    @InjectModel(PathwayEntity)
    private readonly pathwayModel: typeof PathwayEntity,
    private readonly pathwayEventService: PathwayEventService,
    private readonly organizationService: OrganizationService,
  ) {}

  async findAll(
    organizationUuid: string,
    filters: { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' } = {},
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

    const queryWhere: Record<string, unknown> = {
      organization_id: organization.id,
      is_active: true,
    };

    if (filters.status) {
      queryWhere.status = filters.status;
    }

    if (search?.trim()) {
      queryWhere.name = { [Op.iLike]: `%${search.trim()}%` };
    }

    const { count, rows } = await this.pathwayModel.findAndCountAll({
      where: queryWhere,
      include: DEFAULT_PATHWAY_INCLUDES,
      distinct: true,
      order: [[safeSortBy, sortOrder]],
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
        throw new ConflictException(`Pathway "${normalizedName}" already exists in this organization`);
      }
      // Restore soft-deleted pathway
      return this.restorePathway(existing, dto, organization.id);
    }

    const sequelize = this.pathwayModel.sequelize!;
    const transaction = await sequelize.transaction();

    try {
      const pathway = await this.pathwayModel.create(
        {
          organization_id: organization.id,
          name: normalizedName,
          description: dto.description ?? null,
          banner_url: dto.bannerUrl ?? null,
          duration: dto.duration ?? null,
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

      await transaction.commit();
      return pathway.reload({ include: DEFAULT_PATHWAY_INCLUDES });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
        throw new ConflictException(`Pathway "${normalizedName}" already exists in this organization`);
      }
      updateData.name = normalizedName;
    }

    if (dto.description !== undefined) updateData.description = dto.description ?? null;
    if (dto.bannerUrl !== undefined) updateData.banner_url = dto.bannerUrl ?? null;
    if (dto.duration !== undefined) updateData.duration = dto.duration ?? null;
    if (dto.status !== undefined) updateData.status = dto.status;

    const sequelize = this.pathwayModel.sequelize!;
    const transaction = await sequelize.transaction();

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
      return pathway.reload({ include: DEFAULT_PATHWAY_INCLUDES });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const pathway = await this.requirePathway(uuid, organizationUuid);
    await pathway.update({ is_active: false });
    return true;
  }

  // Private helpers

  private async requireOrganization(uuid: string) {
    const org = await this.organizationService.findByUuid(uuid);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  private async requirePathway(uuid: string, organizationUuid: string): Promise<PathwayEntity> {
    const pathway = await this.findByUuid(uuid, organizationUuid);
    if (!pathway) throw new NotFoundException('Pathway not found');
    return pathway;
  }

  private async restorePathway(
    existing: PathwayEntity,
    dto: CreatePathwayDto,
    organizationId: number,
  ): Promise<PathwayEntity> {
    const sequelize = this.pathwayModel.sequelize!;
    const transaction = await sequelize.transaction();

    try {
      const updateData: Partial<PathwayEntity> = {
        is_active: true,
        name: dto.name.trim(),
      };

      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.bannerUrl !== undefined) updateData.banner_url = dto.bannerUrl;
      if (dto.duration !== undefined) updateData.duration = dto.duration;
      if (dto.status !== undefined) updateData.status = dto.status;

      await existing.update(updateData, { transaction });

      if (dto.events?.length) {
        await this.pathwayEventService.syncEvents(
          existing,
          dto.events,
          organizationId,
          transaction,
        );
      }

      await transaction.commit();
      return existing.reload({ include: DEFAULT_PATHWAY_INCLUDES });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
