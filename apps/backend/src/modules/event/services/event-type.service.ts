import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { EventTypeEntity } from '@src/entities/event-type.entity';
import { CreateEventTypeDto, UpdateEventTypeDto } from '../dtos';

/**
 * Event Type Service
 *
 * Manages event types with soft delete using is_active
 */
@Injectable()
export class EventTypeService extends BaseCrudService<
  EventTypeEntity,
  CreateEventTypeDto,
  UpdateEventTypeDto,
  string
> {
  protected override readonly model = EventTypeEntity;
  protected override readonly entityName = 'EventType';
  protected override readonly softDeleteField: string | null = null; // Use is_active boolean instead
  protected override readonly defaultSortField: string = 'created_at';
  protected override readonly defaultSortOrder: 'ASC' | 'DESC' = 'ASC';

  constructor(
    @InjectModel(EventTypeEntity)
    private readonly eventTypeModel: typeof EventTypeEntity,
  ) {
    super();
  }

  override async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<EventTypeEntity>> {
    const { where = {}, ...restOptions } = options;

    return super.findAll({
      ...restOptions,
      where: {
        ...where,
        is_active: true,
      },
    });
  }

  override async create(dto: CreateEventTypeDto): Promise<EventTypeEntity> {
    const normalizedName = dto.name.trim();

    // Check for duplicate name (including soft-deleted)
    const existing = await this.eventTypeModel.findOne({
      where: {
        name: { [Op.iLike]: normalizedName },
      },
    });

    if (existing) {
      // If exists but is soft-deleted, restore it
      if (!existing.is_active) {
        await existing.update({ is_active: true });
        return existing.reload();
      }
      // If exists and is active, throw error
      throw new ConflictException(`Event type "${normalizedName}" already exists`);
    }

    return this.eventTypeModel.create({
      name: normalizedName,
      is_active: true,
    });
  }

  override async update(id: string, dto: UpdateEventTypeDto): Promise<EventTypeEntity> {
    const entity = await this.findOneOrFail(id);

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();

      // Check for duplicate name (excluding current entity)
      const existing = await this.eventTypeModel.findOne({
        where: {
          name: { [Op.iLike]: normalizedName },
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Event type "${normalizedName}" already exists`);
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

  override async findOne(id: string): Promise<EventTypeEntity | null> {
    return this.eventTypeModel.findOne({
      where: {
        id,
        is_active: true,
      },
    });
  }
}

