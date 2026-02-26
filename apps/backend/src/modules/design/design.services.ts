import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { DesignEntity } from '@src/entities';
import { UpdateDesignDto } from './dtos/update-design.dto';
import { CreateDesignDto } from './dtos/create-design.dto';
import { toTitleCase } from '@src/commons/utils';
import { CurrentUser } from '../auth/interfaces';
import { EventService } from '../event/services/event.service';

@Injectable()
export class DesignService extends BaseCrudService<
  DesignEntity,
  CreateDesignDto,
  UpdateDesignDto,
  number
> {
  protected override readonly model = DesignEntity;
  protected override readonly entityName = 'Design';
  protected override readonly defaultSortField = 'type';
  protected override readonly defaultSortOrder: 'ASC' | 'DESC' = 'ASC';
  protected override readonly softDeleteField: string | null = null;

  constructor(
    @InjectModel(DesignEntity)
    private readonly designModel: typeof DesignEntity,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {
    super();
  }

  override async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<DesignEntity>> {
    const { where = {}, ...rest } = options;

    return super.findAll({
      ...rest,
      where: {
        ...where,
        ...(options.where?.type ? { type: options.where.type } : {}),
      },
    });
  }

  async searchDesigns(
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<DesignEntity>> {
    return super.findAll({
      ...options,
      where: {
        ...options.where,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchQuery}%` } },
          { type: { [Op.iLike]: `%${searchQuery}%` } },
        ],
      },
    });
  }

  async findOneByUuid(uuid: string): Promise<DesignEntity> {
    const design = await this.findByUuid(uuid);

    if (!design) {
      throw new NotFoundException(`Design with UUID ${uuid} not found`);
    }

    return design;
  }

  async createWithUser(currentUser: CurrentUser, dto: CreateDesignDto): Promise<DesignEntity> {
    return this.designModel.create({
      name: toTitleCase(dto.name),
      type: dto.designType,
      organization_id: currentUser.organizationId,
      url: dto.designUrl,
      layout: dto.layout ?? null,
    });
  }

  override async updateByUuid(uuid: string, dto: UpdateDesignDto): Promise<DesignEntity> {
    const design = await this.findByUuidOrFail(uuid);

    const updateData: Partial<DesignEntity> = {};

    if (dto.name !== undefined) {
      updateData.name = toTitleCase(dto.name);
    }

    if (dto.designUrl !== undefined && dto.designUrl !== '') {
      updateData.url = dto.designUrl;
    }

    if (dto.designType !== undefined) {
      updateData.type = dto.designType;
    }

    if (dto.layout !== undefined) {
      updateData.layout = dto.layout;
    }

    await design.update(updateData);

    return design;
  }

  async findByType(type: string): Promise<DesignEntity[]> {
    return this.designModel.findAll({
      where: { type },
    });
  }

  override async deleteByUuid(uuid: string): Promise<boolean> {
    const design = await this.findByUuidOrFail(uuid);

    const isUsedByEvent = await this.eventService.hasActiveEventsForDesign(design.id);
    if (isUsedByEvent) {
      throw new ConflictException('Cannot delete this design because it is associated with one or more events');
    }

    return super.deleteByUuid(uuid);
  }
}
