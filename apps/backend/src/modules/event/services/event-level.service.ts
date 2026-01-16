import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { EventLevelEntity } from '@src/entities/event-level.entity';
import { CreateEventLevelDto, UpdateEventLevelDto } from '../dtos';

/**
 * Event Level Service
 *
 * Manages event levels with soft delete using is_active
 */
@Injectable()
export class EventLevelService extends BaseCrudService<
  EventLevelEntity,
  CreateEventLevelDto,
  UpdateEventLevelDto,
  string
> {
  protected override readonly model = EventLevelEntity;
  protected override readonly entityName = 'EventLevel';
  protected override readonly softDeleteField: string | null = null; // Use is_active boolean instead
  protected override readonly defaultSortField: string = 'created_at';
  protected override readonly defaultSortOrder: 'ASC' | 'DESC' = 'ASC';

  constructor(
    @InjectModel(EventLevelEntity)
    private readonly eventLevelModel: typeof EventLevelEntity,
  ) {
    super();
  }

  override async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<EventLevelEntity>> {
    const { where = {}, ...restOptions } = options;

    return super.findAll({
      ...restOptions,
      where: {
        ...where,
        is_active: true,
      },
    });
  }

  override async create(dto: CreateEventLevelDto): Promise<EventLevelEntity> {
    const normalizedName = dto.name.trim();

    // Check for duplicate name
    const existing = await this.eventLevelModel.findOne({
      where: {
        name: { [Op.iLike]: normalizedName },
      },
    });

    if (existing) {
      throw new ConflictException(`Event level "${normalizedName}" already exists`);
    }

    return this.eventLevelModel.create({
      name: normalizedName,
      is_active: true,
    });
  }

  override async update(id: string, dto: UpdateEventLevelDto): Promise<EventLevelEntity> {
    const entity = await this.findOneOrFail(id);

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();

      // Check for duplicate name (excluding current entity)
      const existing = await this.eventLevelModel.findOne({
        where: {
          name: { [Op.iLike]: normalizedName },
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Event level "${normalizedName}" already exists`);
      }

      await entity.update({ name: normalizedName });
    }

    return entity;
  }

  override async softDelete(id: string): Promise<boolean> {
    const entity = await this.findOneOrFail(id);
    await entity.update({ is_active: false });
    return true;
  }

  override async findOne(id: string): Promise<EventLevelEntity | null> {
    return this.eventLevelModel.findOne({
      where: {
        id,
        is_active: true,
      },
    });
  }
}

