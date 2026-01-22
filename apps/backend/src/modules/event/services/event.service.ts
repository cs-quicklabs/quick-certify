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
  number
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
    // Validate that referenced master records exist and are active (by UUID)
    const [eventType, eventLevel, eventFormat] = await Promise.all([
      this.eventTypeService.findByUuid(dto.eventTypeId),
      this.eventLevelService.findByUuid(dto.eventLevelId),
      this.eventFormatService.findByUuid(dto.eventFormatId),
    ]);

    if (!eventType) {
      throw new BadRequestException(`Event type with UUID ${dto.eventTypeId} not found or inactive`);
    }

    if (!eventLevel) {
      throw new BadRequestException(
        `Event level with UUID ${dto.eventLevelId} not found or inactive`,
      );
    }

    if (!eventFormat) {
      throw new BadRequestException(
        `Event format with UUID ${dto.eventFormatId} not found or inactive`,
      );
    }

    return this.eventModel.create({
      name: dto.name.trim(),
      event_type_id: eventType.id,
      event_level_id: eventLevel.id,
      event_format_id: eventFormat.id,
      is_active: true,
    });
  }

  override async update(id: number, dto: UpdateEventDto): Promise<EventEntity> {
    const entity = await this.findOneOrFail(id);

    const updateData: Partial<EventEntity> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    // Validate referenced UUIDs if provided and convert to IDs
    if (dto.eventTypeId !== undefined) {
      const eventType = await this.eventTypeService.findByUuid(dto.eventTypeId);

      if (!eventType) {
        throw new BadRequestException(
          `Event type with UUID ${dto.eventTypeId} not found or inactive`,
        );
      }

      updateData.event_type_id = eventType.id;
    }

    if (dto.eventLevelId !== undefined) {
      const eventLevel = await this.eventLevelService.findByUuid(dto.eventLevelId);

      if (!eventLevel) {
        throw new BadRequestException(
          `Event level with UUID ${dto.eventLevelId} not found or inactive`,
        );
      }

      updateData.event_level_id = eventLevel.id;
    }

    if (dto.eventFormatId !== undefined) {
      const eventFormat = await this.eventFormatService.findByUuid(dto.eventFormatId);

      if (!eventFormat) {
        throw new BadRequestException(
          `Event format with UUID ${dto.eventFormatId} not found or inactive`,
        );
      }

      updateData.event_format_id = eventFormat.id;
    }

    await entity.update(updateData);

    return entity;
  }

  override async softDelete(id: number): Promise<boolean> {
    const entity = await this.findOneOrFail(id);
    await entity.update({ is_active: false });
    return true;
  }

  override async softDeleteByUuid(uuid: string): Promise<boolean> {
    const entity = await this.findByUuidOrFail(uuid);
    await entity.update({ is_active: false });
    return true;
  }

  override async findOne(id: number): Promise<EventEntity | null> {
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
