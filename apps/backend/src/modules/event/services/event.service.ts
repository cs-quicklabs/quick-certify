import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { EventEntity } from '@src/entities/event.entity';
import { EventTypeEntity } from '@src/entities/event-type.entity';
import { EventLevelEntity } from '@src/entities/event-level.entity';
import { EventFormatEntity } from '@src/entities/event-format.entity';
import { CreateEventDto, UpdateEventDto } from '../dtos';
import { EventTypeService } from './event-type.service';
import { EventLevelService } from './event-level.service';
import { EventFormatService } from './event-format.service';
import { OrganizationService } from '@src/modules/organization/organization.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(EventEntity)
    private readonly eventModel: typeof EventEntity,
    private readonly eventTypeService: EventTypeService,
    private readonly eventLevelService: EventLevelService,
    private readonly eventFormatService: EventFormatService,
    private readonly organizationService: OrganizationService,
  ) {}

  /**
   * Find all active events for an organization
   */
  async findAll(
    organizationUuid: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<EventEntity>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', where = {} } = options;

    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      };
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.eventModel.findAndCountAll({
      where: {
        organization_id: organization.id,
        is_active: true,
        ...where,
      },
      include: [
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
      ],
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

  /**
   * Find one event by UUID within organization
   */
  async findByUuid(uuid: string, organizationUuid: string): Promise<EventEntity | null> {
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      return null;
    }

    return this.eventModel.findOne({
      where: {
        uuid,
        organization_id: organization.id,
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

  /**
   * Create a new event for an organization
   */
  async create(organizationUuid: string, dto: CreateEventDto): Promise<EventEntity> {
    const organization = await this.requireOrganization(organizationUuid);
    const normalizedName = dto.name.trim();

    // Check for duplicate event name within the same organization
    const existingEvent = await this.eventModel.findOne({
      where: {
        organization_id: organization.id,
        name: { [Op.iLike]: normalizedName },
      },
    });

    // Validate referenced master records
    const { eventType, eventLevel, eventFormat } = await this.validateEventReferences(
      organizationUuid,
      dto,
    );

    if (existingEvent) {
      return this.handleExistingEvent(
        existingEvent,
        normalizedName,
        eventType,
        eventLevel,
        eventFormat,
      );
    }

    return this.eventModel.create({
      organization_id: organization.id,
      name: normalizedName,
      event_type_id: eventType.id,
      event_level_id: eventLevel.id,
      event_format_id: eventFormat.id,
      is_active: true,
    });
  }

  /**
   * Handle existing event - restore if soft-deleted, throw if active
   */
  private async handleExistingEvent(
    existingEvent: EventEntity,
    normalizedName: string,
    eventType: EventTypeEntity,
    eventLevel: EventLevelEntity,
    eventFormat: EventFormatEntity,
  ): Promise<EventEntity> {
    if (existingEvent.is_active) {
      throw new ConflictException(`Event "${normalizedName}" already exists in this organization`);
    }

    // Restore soft-deleted event with new values
    await existingEvent.update({
      event_type_id: eventType.id,
      event_level_id: eventLevel.id,
      event_format_id: eventFormat.id,
      is_active: true,
    });

    return existingEvent.reload({
      include: [
        { model: EventTypeEntity, as: 'event_type' },
        { model: EventLevelEntity, as: 'event_level' },
        { model: EventFormatEntity, as: 'event_format' },
      ],
    });
  }

  /**
   * Update an event by UUID within organization
   */
  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdateEventDto,
  ): Promise<EventEntity> {
    const event = await this.findByUuidOrFail(uuid, organizationUuid);

    const organization = await this.requireOrganization(organizationUuid);

    const updateData: Partial<EventEntity> = {};

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();

      // Check for duplicate name (excluding current event)
      const existingEvent = await this.eventModel.findOne({
        where: {
          organization_id: organization.id,
          name: { [Op.iLike]: normalizedName },
          id: { [Op.ne]: event.id },
        },
      });

      if (existingEvent) {
        throw new ConflictException(
          `Event "${normalizedName}" already exists in this organization`,
        );
      }

      updateData.name = normalizedName;
    }

    // Validate referenced UUIDs if provided and convert to IDs
    if (dto.eventTypeId !== undefined) {
      const eventType = await this.eventTypeService.findByUuid(dto.eventTypeId, organizationUuid);
      if (!eventType) {
        throw new BadRequestException(
          `Event type with UUID ${dto.eventTypeId} not found or inactive`,
        );
      }
      updateData.event_type_id = eventType.id;
    }

    if (dto.eventLevelId !== undefined) {
      const eventLevel = await this.eventLevelService.findByUuid(
        dto.eventLevelId,
        organizationUuid,
      );
      if (!eventLevel) {
        throw new BadRequestException(
          `Event level with UUID ${dto.eventLevelId} not found or inactive`,
        );
      }
      updateData.event_level_id = eventLevel.id;
    }

    if (dto.eventFormatId !== undefined) {
      const eventFormat = await this.eventFormatService.findByUuid(
        dto.eventFormatId,
        organizationUuid,
      );
      if (!eventFormat) {
        throw new BadRequestException(
          `Event format with UUID ${dto.eventFormatId} not found or inactive`,
        );
      }
      updateData.event_format_id = eventFormat.id;
    }

    await event.update(updateData);

    return event.reload({
      include: [
        { model: EventTypeEntity, as: 'event_type' },
        { model: EventLevelEntity, as: 'event_level' },
        { model: EventFormatEntity, as: 'event_format' },
      ],
    });
  }

  /**
   * Soft delete an event by UUID within organization
   */
  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const event = await this.findByUuidOrFail(uuid, organizationUuid);
    await event.update({ is_active: false });
    return true;
  }

  /**
   * Search events within organization
   */
  async searchEvents(
    organizationUuid: string,
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<EventEntity>> {
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

  private async findByUuidOrFail(uuid: string, organizationUuid: string): Promise<EventEntity> {
    const event = await this.findByUuid(uuid, organizationUuid);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  private async requireOrganization(uuid: string) {
    const organization = await this.organizationService.findByUuid(uuid);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  private async validateEventReferences(
    organizationUuid: string,
    dto: CreateEventDto | UpdateEventDto,
  ): Promise<{
    eventType: EventTypeEntity;
    eventLevel: EventLevelEntity;
    eventFormat: EventFormatEntity;
  }> {
    const createDto = dto as CreateEventDto;
    const [eventType, eventLevel, eventFormat] = await Promise.all([
      this.eventTypeService.findByUuid(createDto.eventTypeId, organizationUuid),
      this.eventLevelService.findByUuid(createDto.eventLevelId, organizationUuid),
      this.eventFormatService.findByUuid(createDto.eventFormatId, organizationUuid),
    ]);

    if (!eventType) {
      throw new BadRequestException(
        `Event type with UUID ${createDto.eventTypeId} not found or inactive`,
      );
    }
    if (!eventLevel) {
      throw new BadRequestException(
        `Event level with UUID ${createDto.eventLevelId} not found or inactive`,
      );
    }
    if (!eventFormat) {
      throw new BadRequestException(
        `Event format with UUID ${createDto.eventFormatId} not found or inactive`,
      );
    }

    return { eventType, eventLevel, eventFormat };
  }
}
