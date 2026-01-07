import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { OrganizationEntity } from '@src/entities';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos';

@Injectable()
export class OrganizationService extends BaseCrudService<
  OrganizationEntity,
  CreateOrganizationDto,
  UpdateOrganizationDto
> {
  protected readonly model = OrganizationEntity;
  protected readonly entityName = 'Organization';

  constructor(
    @InjectModel(OrganizationEntity)
    private organizationModel: typeof OrganizationEntity,
  ) {
    super();
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<OrganizationEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', where = {} } = options;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.organizationModel.findAndCountAll({
      where: {
        ...where,
        deleted_at: null,
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

  async findOne(id: number): Promise<OrganizationEntity | null> {
    return this.organizationModel.findOne({
      where: { id, deleted_at: null },
    });
  }

  async findByUuid(uuid: string): Promise<OrganizationEntity | null> {
    return this.organizationModel.findOne({
      where: { uuid, deleted_at: null },
    });
  }

  async create(dto: CreateOrganizationDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.create({
      name: dto.name,
      image: dto.image || null,
      address: dto.address || null,
      phone: dto.phone || null,
      email: dto.email || null,
      website: dto.website || null,
      description: dto.description || null,
    });

    return organization;
  }

  async update(id: number, dto: UpdateOrganizationDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, deleted_at: null },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const updateData: Partial<OrganizationEntity> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.website !== undefined) updateData.website = dto.website;
    if (dto.description !== undefined) updateData.description = dto.description;

    await organization.update(updateData);

    return organization;
  }

  async softDelete(id: number): Promise<boolean> {
    const organization = await this.organizationModel.findOne({
      where: { id, deleted_at: null },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    await organization.update({ deleted_at: new Date() });

    return true;
  }

  async restore(id: number): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, deleted_at: { [Op.ne]: null } },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found or not deleted');
    }

    await organization.update({ deleted_at: null });

    return organization;
  }

  async searchOrganizations(
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<OrganizationEntity>> {
    const searchCondition = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { email: { [Op.iLike]: `%${searchQuery}%` } },
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
}
