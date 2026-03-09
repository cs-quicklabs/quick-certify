import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { sanitizePagination, buildPaginatedResult } from '@src/commons/utils';
import { SkillEntity, OrganizationEntity } from '@src/entities';
import { CreateSkillDto, UpdateSkillDto } from './dtos';
import { EventSkillService } from '@src/modules/event/services/event-skill.service';

/**
 * Skill Service
 *
 * SRP: Manages skills for organizations
 * Skills are organization-specific and cannot have duplicate names within the same organization
 */
@Injectable()
export class SkillService {
  constructor(
    @InjectModel(SkillEntity)
    private readonly skillModel: typeof SkillEntity,
    private readonly eventSkillService: EventSkillService,
  ) {}

  async findAll(
    organizationUuid: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<SkillEntity>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC', where = {} } = options;

    // First find organization by UUID to get its ID
    const organization = await OrganizationEntity.findOne({ where: { uuid: organizationUuid } });
    if (!organization) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      };
    }

    const pagination = sanitizePagination(page, limit);

    const { count, rows } = await this.skillModel.findAndCountAll({
      where: {
        organization_id: organization.id,
        ...where,
      },
      order: [[sortBy, sortOrder]],
      limit: pagination.safeLimit,
      offset: pagination.offset,
    });

    return buildPaginatedResult(rows, count, pagination);
  }

  async findOne(id: number, organizationId: number): Promise<SkillEntity | null> {
    return this.skillModel.findOne({
      where: { id, organization_id: organizationId },
    });
  }

  async findByUuid(uuid: string, organizationUuid: string): Promise<SkillEntity | null> {
    // First find organization by UUID to get its ID
    const organization = await OrganizationEntity.findOne({ where: { uuid: organizationUuid } });
    if (!organization) {
      return null;
    }

    const skill = await this.skillModel.findOne({
      where: { uuid, organization_id: organization.id },
    });
    return skill;
  }

  async create(organizationUuid: string, dto: CreateSkillDto): Promise<SkillEntity> {
    // First find organization by UUID to get its ID
    const organization = await OrganizationEntity.findOne({ where: { uuid: organizationUuid } });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Normalize skill name (trim and check for duplicates)
    const normalizedName = dto.name.trim();

    // Check for duplicate skill name within the same organization
    const existingSkill = await this.skillModel.findOne({
      where: {
        organization_id: organization.id,
        name: { [Op.iLike]: normalizedName },
      },
    });

    if (existingSkill) {
      throw new ConflictException(`Skill "${normalizedName}" already exists`);
    }

    return this.skillModel.create({
      organization_id: organization.id,
      name: normalizedName,
    });
  }

  async update(id: number, organizationId: number, dto: UpdateSkillDto): Promise<SkillEntity> {
    const skill = await this.requireById(id, organizationId);

    if (dto.name !== undefined) {
      // Normalize skill name
      const normalizedName = dto.name.trim();

      // Check for duplicate skill name (excluding current skill)
      const existingSkill = await this.skillModel.findOne({
        where: {
          organization_id: organizationId,
          name: { [Op.iLike]: normalizedName },
          id: { [Op.ne]: id },
        },
      });

      if (existingSkill) {
        throw new ConflictException(`Skill "${normalizedName}" already exists`);
      }

      await skill.update({ name: normalizedName });
    }

    return skill;
  }

  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdateSkillDto,
  ): Promise<SkillEntity> {
    const skill = await this.findByUuidOrFail(uuid, organizationUuid);
    return this.update(skill.id, skill.organization_id, dto);
  }

  async delete(id: number, organizationId: number): Promise<boolean> {
    const skill = await this.requireById(id, organizationId);
    const eventCount = await this.eventSkillService.countBySkillId(id);
    if (eventCount > 0) {
      throw new ConflictException(
        `Cannot delete skill: it is associated with ${eventCount} event(s)`,
      );
    }
    await skill.destroy();
    return true;
  }

  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const skill = await this.findByUuidOrFail(uuid, organizationUuid);
    return this.delete(skill.id, skill.organization_id);
  }

  async searchSkills(
    organizationUuid: string,
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<SkillEntity>> {
    const searchCondition = {
      name: { [Op.iLike]: `%${searchQuery}%` },
    };

    return this.findAll(organizationUuid, {
      ...options,
      where: {
        ...options.where,
        ...searchCondition,
      },
    });
  }

  // Private helper methods

  private async requireById(id: number, organizationId: number): Promise<SkillEntity> {
    const skill = await this.skillModel.findOne({
      where: { id, organization_id: organizationId },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }

  private async findByUuidOrFail(uuid: string, organizationUuid: string): Promise<SkillEntity> {
    const skill = await this.findByUuid(uuid, organizationUuid);
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }
}
