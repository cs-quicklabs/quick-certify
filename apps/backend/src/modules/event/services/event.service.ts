import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseCrudService, FindAllOptions, PaginatedResult } from '@src/commons/base';
import { EventEntity } from '@src/entities/event.entity';
import { EventTypeEntity } from '@src/entities/event-type.entity';
import { EventLevelEntity } from '@src/entities/event-level.entity';
import { EventFormatEntity } from '@src/entities/event-format.entity';
import { CreateEventDto, UpdateEventDto } from '../dtos';
import { EventTypeService } from './event-type.service';
import { EventLevelService } from './event-level.service';
import { EventFormatService } from './event-format.service';

/**
 * Event Service
 *
 * Manages events with references to type, level, and format
 * Ensures referenced master records exist and are active before creating events
 * SRP: Only manages EventEntity, delegates validation to respective services
 */
@Injectable()
export class EventService extends BaseCrudService<
  EventEntity,
  CreateEventDto,
  UpdateEventDto,
  string
> {
  protected override readonly model = EventEntity;
  protected override readonly entityName = 'Event';
  protected override readonly softDeleteField: string | null = null; // Use is_active boolean instead
  protected override readonly defaultSortField: string = 'created_at';
  protected override readonly defaultSortOrder: 'ASC' | 'DESC' = 'DESC';

  constructor(
    @InjectModel(EventEntity)
    private readonly eventModel: typeof EventEntity,
    private readonly eventTypeService: EventTypeService,
    private readonly eventLevelService: EventLevelService,
    private readonly eventFormatService: EventFormatService,
  ) {
    super();
  }

  override async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<EventEntity>> {
    const { where = {}, include = [], ...restOptions } = options;

    // Always include relations
    const defaultInclude = [
      {
        model: EventTypeEntity,
        as: 'event_type',
        where: { is_active: true },
        required: true,
      },
      {
        model: EventLevelEntity,
        as: 'event_level',
        where: { is_active: true },
        required: true,
      },
      {
        model: EventFormatEntity,
        as: 'event_format',
        where: { is_active: true },
        required: true,
      },
    ];

    return super.findAll({
      ...restOptions,
      where: {
        ...where,
        is_active: true,
      },
      include: [...defaultInclude, ...include],
    });
  }

  override async create(dto: CreateEventDto): Promise<EventEntity> {
    // Validate that referenced master records exist and are active
    const [eventType, eventLevel, eventFormat] = await Promise.all([
      this.eventTypeService.findOne(dto.eventTypeId),
      this.eventLevelService.findOne(dto.eventLevelId),
      this.eventFormatService.findOne(dto.eventFormatId),
    ]);

    if (!eventType) {
      throw new BadRequestException(`Event type with ID ${dto.eventTypeId} not found or inactive`);
    }

    if (!eventLevel) {
      throw new BadRequestException(
        `Event level with ID ${dto.eventLevelId} not found or inactive`,
      );
    }

    if (!eventFormat) {
      throw new BadRequestException(
        `Event format with ID ${dto.eventFormatId} not found or inactive`,
      );
    }

    return this.eventModel.create({
      name: dto.name.trim(),
      event_type_id: dto.eventTypeId,
      event_level_id: dto.eventLevelId,
      event_format_id: dto.eventFormatId,
      is_active: true,
    });
  }

  override async update(id: string, dto: UpdateEventDto): Promise<EventEntity> {
    const entity = await this.findOneOrFail(id);

    const updateData: Partial<EventEntity> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    // Validate referenced IDs if provided
    if (dto.eventTypeId !== undefined) {
      const eventType = await this.eventTypeService.findOne(dto.eventTypeId);

      if (!eventType) {
        throw new BadRequestException(
          `Event type with ID ${dto.eventTypeId} not found or inactive`,
        );
      }

      updateData.event_type_id = dto.eventTypeId;
    }

    if (dto.eventLevelId !== undefined) {
      const eventLevel = await this.eventLevelService.findOne(dto.eventLevelId);

      if (!eventLevel) {
        throw new BadRequestException(
          `Event level with ID ${dto.eventLevelId} not found or inactive`,
        );
      }

      updateData.event_level_id = dto.eventLevelId;
    }

    if (dto.eventFormatId !== undefined) {
      const eventFormat = await this.eventFormatService.findOne(dto.eventFormatId);

      if (!eventFormat) {
        throw new BadRequestException(
          `Event format with ID ${dto.eventFormatId} not found or inactive`,
        );
      }

      updateData.event_format_id = dto.eventFormatId;
    }

    await entity.update(updateData);

    return entity;
  }

  override async softDelete(id: string): Promise<boolean> {
    const entity = await this.findOneOrFail(id);
    await entity.update({ is_active: false });
    return true;
  }

  override async findOne(id: string): Promise<EventEntity | null> {
    return this.eventModel.findOne({
      where: {
        id,
        is_active: true,
      },
      include: [
        {
          model: EventTypeEntity,
          as: 'event_type',
          where: { is_active: true },
          required: false,
        },
        {
          model: EventLevelEntity,
          as: 'event_level',
          where: { is_active: true },
          required: false,
        },
        {
          model: EventFormatEntity,
          as: 'event_format',
          where: { is_active: true },
          required: false,
        },
      ],
    });
  }
}
