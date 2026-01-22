import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { SkillEntity } from '@src/entities/skill.entity';
import { CreateSkillDto, UpdateSkillDto } from './dtos';

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
  ) {}

  async findAll(
    organizationId: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<SkillEntity>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC', where = {} } = options;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.skillModel.findAndCountAll({
      where: {
        organizationId,
        ...where,
      },
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

  async findOne(id: string, organizationId: string): Promise<SkillEntity | null> {
    return this.skillModel.findOne({
      where: { id, organizationId },
    });
  }

  async create(organizationId: string, dto: CreateSkillDto): Promise<SkillEntity> {
    // Normalize skill name (trim and check for duplicates)
    const normalizedName = dto.name.trim();

    // Check for duplicate skill name within the same organization
    const existingSkill = await this.skillModel.findOne({
      where: {
        organizationId,
        name: { [Op.iLike]: normalizedName },
      },
    });

    if (existingSkill) {
      throw new ConflictException(`Skill "${normalizedName}" already exists`);
    }

    return this.skillModel.create({
      organizationId,
      name: normalizedName,
    });
  }

  async update(id: string, organizationId: string, dto: UpdateSkillDto): Promise<SkillEntity> {
    const skill = await this.requireById(id, organizationId);

    if (dto.name !== undefined) {
      // Normalize skill name
      const normalizedName = dto.name.trim();

      // Check for duplicate skill name (excluding current skill)
      const existingSkill = await this.skillModel.findOne({
        where: {
          organizationId,
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

  async delete(id: string, organizationId: string): Promise<boolean> {
    const skill = await this.requireById(id, organizationId);
    await skill.destroy();
    return true;
  }

  async searchSkills(
    organizationId: string,
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<SkillEntity>> {
    const searchCondition = {
      name: { [Op.iLike]: `%${searchQuery}%` },
    };

    return this.findAll(organizationId, {
      ...options,
      where: {
        ...options.where,
        ...searchCondition,
      },
    });
  }

  // Private helper methods

  private async requireById(id: string, organizationId: string): Promise<SkillEntity> {
    const skill = await this.skillModel.findOne({
      where: { id, organizationId },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }
}
