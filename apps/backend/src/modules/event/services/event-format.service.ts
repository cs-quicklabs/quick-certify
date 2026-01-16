import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { EventFormatEntity } from '@src/entities/event-format.entity';
import { CreateEventFormatDto, UpdateEventFormatDto } from '../dtos';

/**
 * Event Format Service
 *
 * Manages event formats with soft delete using is_active
 */
@Injectable()
export class EventFormatService extends BaseCrudService<
  EventFormatEntity,
  CreateEventFormatDto,
  UpdateEventFormatDto,
  string
> {
  protected override readonly model = EventFormatEntity;
  protected override readonly entityName = 'EventFormat';
  protected override readonly softDeleteField: string | null = null; // Use is_active boolean instead
  protected override readonly defaultSortField: string = 'created_at';
  protected override readonly defaultSortOrder: 'ASC' | 'DESC' = 'ASC';

  constructor(
    @InjectModel(EventFormatEntity)
    private readonly eventFormatModel: typeof EventFormatEntity,
  ) {
    super();
  }

  override async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<EventFormatEntity>> {
    const { where = {}, ...restOptions } = options;

    return super.findAll({
      ...restOptions,
      where: {
        ...where,
        is_active: true,
      },
    });
  }

  override async create(dto: CreateEventFormatDto): Promise<EventFormatEntity> {
    const normalizedName = dto.name.trim();

    // Check for duplicate name
    const existing = await this.eventFormatModel.findOne({
      where: {
        name: { [Op.iLike]: normalizedName },
      },
    });

    if (existing) {
      throw new ConflictException(`Event format "${normalizedName}" already exists`);
    }

    return this.eventFormatModel.create({
      name: normalizedName,
      is_active: true,
    });
  }

  override async update(id: string, dto: UpdateEventFormatDto): Promise<EventFormatEntity> {
    const entity = await this.findOneOrFail(id);

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();

      // Check for duplicate name (excluding current entity)
      const existing = await this.eventFormatModel.findOne({
        where: {
          name: { [Op.iLike]: normalizedName },
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Event format "${normalizedName}" already exists`);
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

  override async findOne(id: string): Promise<EventFormatEntity | null> {
    return this.eventFormatModel.findOne({
      where: {
        id,
        is_active: true,
      },
    });
  }
}

