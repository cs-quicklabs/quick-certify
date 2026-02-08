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
import { SkillEntity } from '@src/entities/skill.entity';
import { EventSkillEntity } from '@src/entities/event-skill.entity';
import { CreateEventDto, UpdateEventDto } from '../dtos';
import { EventTypeService } from './event-type.service';
import { EventLevelService } from './event-level.service';
import { EventFormatService } from './event-format.service';
import { DesignService } from '@src/modules/design/design.services';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { DesignEntity } from '@src/entities';

/**
 * Event Service
 *
 * Handles event CRUD operations with support for progressive creation:
 * - Step 1: Create event with minimal data (name only)
 * - Step 2: Update with additional details (type, level, format, design, description, website)
 *
 * All reference fields (eventType, eventLevel, eventFormat, design) are optional
 * to support this progressive creation pattern.
 */
@Injectable()
export class EventService {
  constructor(
    @InjectModel(EventEntity)
    private readonly eventModel: typeof EventEntity,
    @InjectModel(EventSkillEntity)
    private readonly eventSkillModel: typeof EventSkillEntity,
    @InjectModel(SkillEntity)
    private readonly skillModel: typeof SkillEntity,
    private readonly eventTypeService: EventTypeService,
    private readonly eventLevelService: EventLevelService,
    private readonly eventFormatService: EventFormatService,
    private readonly designService: DesignService,
    private readonly organizationService: OrganizationService,
  ) {}

  /**
   * Find all active events for an organization
   *
   * Includes optional relationships (event_type, event_level, event_format)
   * that may be null for events created with progressive creation pattern.
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
          required: false, // Changed to false - event may not have a type yet
        },
        {
          model: EventLevelEntity,
          as: 'event_level',
          where: { is_active: true },
          required: false, // Changed to false - event may not have a level yet
        },
        {
          model: EventFormatEntity,
          as: 'event_format',
          where: { is_active: true },
          required: false, // Changed to false - event may not have a format yet
        },
        {
          model: DesignEntity,
          as: 'design',
          required: false,
        },
        {
          model: SkillEntity,
          as: 'skills',
          required: false,
          through: { attributes: [] }, // Don't include junction table fields
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
   *
   * Returns null if event not found or belongs to different organization.
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
        {
          model: DesignEntity,
          as: 'design',
          required: false,
        },
        {
          model: SkillEntity,
          as: 'skills',
          required: false,
          through: { attributes: [] },
        },
      ],
    });
  }

  /**
   * Create a new event for an organization
   *
   * Supports progressive creation:
   * - Minimal: { name }
   * - Full: { name, eventTypeId, eventLevelId, eventFormatId, designId, description, website }
   *
   * If an event with the same name exists but is soft-deleted, it will be restored
   * with the new values provided.
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

    // Validate required designId
    if (!dto.designId) {
      throw new BadRequestException('Design ID is required');
    }

    // Validate optional referenced master records
    const references = await this.validateOptionalEventReferences(organizationUuid, dto);

    if (existingEvent) {
      return this.handleExistingEvent(existingEvent, normalizedName, dto, references, organizationUuid);
    }

    // Create new event with optional fields
    const event = await this.eventModel.create({
      organization_id: organization.id,
      name: normalizedName,
      description: dto.description ?? null,
      learning_link: dto.learningLink ?? null,
      event_type_id: references.eventType?.id ?? null,
      event_level_id: references.eventLevel?.id ?? null,
      event_format_id: references.eventFormat?.id ?? null,
      design_id: references.design?.id ?? null,
      is_active: true,
    });

    // Associate skills if provided
    if (dto.skillIds && dto.skillIds.length > 0) {
      await this.associateSkillsWithEvent(event, dto.skillIds, organizationUuid);
    }

    return this.findByUuid(event.uuid, organizationUuid) as Promise<EventEntity>;
  }

  /**
   * Handle existing event - restore if soft-deleted, throw if active
   *
   * If the existing event is soft-deleted, it will be restored with new values.
   * If the existing event is active, a ConflictException is thrown.
   */
  private async handleExistingEvent(
    existingEvent: EventEntity,
    normalizedName: string,
    dto: CreateEventDto,
    references: {
      eventType?: EventTypeEntity;
      eventLevel?: EventLevelEntity;
      eventFormat?: EventFormatEntity;
      design?: DesignEntity;
    },
    organizationUuid: string,
  ): Promise<EventEntity> {
    if (existingEvent.is_active) {
      throw new ConflictException(`Event "${normalizedName}" already exists in this organization`);
    }

    // Restore soft-deleted event with new values (merge with provided values)
    const updateData: Partial<EventEntity> = {
      is_active: true,
    };

    // Only update fields that were provided in the DTO
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.learningLink !== undefined) {
      updateData.learning_link = dto.learningLink;
    }
    if (references.eventType) {
      updateData.event_type_id = references.eventType.id;
    }
    if (references.eventLevel) {
      updateData.event_level_id = references.eventLevel.id;
    }
    if (references.eventFormat) {
      updateData.event_format_id = references.eventFormat.id;
    }
    if (references.design) {
      updateData.design_id = references.design.id;
    }

    await existingEvent.update(updateData);

    // Associate skills if provided
    if (dto.skillIds && dto.skillIds.length > 0) {
      await this.associateSkillsWithEvent(existingEvent, dto.skillIds, organizationUuid);
    }

    return existingEvent.reload({
      include: [
        { model: EventTypeEntity, as: 'event_type', required: false },
        { model: EventLevelEntity, as: 'event_level', required: false },
        { model: EventFormatEntity, as: 'event_format', required: false },
        { model: DesignEntity, as: 'design', required: false },
        { model: SkillEntity, as: 'skills', required: false, through: { attributes: [] } },
      ],
    });
  }

  /**
   * Associate skills with an event by their UUIDs
   * Uses raw queries to avoid Sequelize association issues with UUIDs
   */
  private async associateSkillsWithEvent(
    event: EventEntity,
    skillUuids: string[],
    organizationUuid: string,
  ): Promise<void> {
    if (!skillUuids || skillUuids.length === 0) return;

    // Get organization to filter skills
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Find skills by UUID and validate they exist and belong to organization
    const skills = await this.skillModel.findAll({
      where: {
        uuid: skillUuids,
        organization_id: organization.id,
      },
    });

    if (skills.length !== skillUuids.length) {
      const foundUuids = skills.map((s) => s.uuid);
      const missingUuids = skillUuids.filter((uuid) => !foundUuids.includes(uuid));
      throw new BadRequestException(
        `Skills not found or inactive: ${missingUuids.join(', ')}`,
      );
    }

    // Clear existing skills first
    await this.eventSkillModel.destroy({
      where: { event_id: event.id },
    });

    // Insert new skill associations (timestamps handled by Sequelize)
    const associations = skills.map((skill) => ({
      event_id: event.id,
      skill_id: skill.id,
    }));

    await this.eventSkillModel.bulkCreate(associations, {
      fields: ['event_id', 'skill_id'],
    });
  }

  /**
   * Update event skills - syncs the skills association
   */
  private async updateEventSkills(
    event: EventEntity,
    skillUuids: string[],
    organizationUuid: string,
  ): Promise<void> {
    // Clear existing skills first (always clear then re-add)
    await this.eventSkillModel.destroy({
      where: { event_id: event.id },
    });

    // If empty array, we're done (all skills cleared)
    if (skillUuids.length === 0) {
      return;
    }

    // Validate and add new skills
    await this.associateSkillsWithEvent(event, skillUuids, organizationUuid);
  }

  /**
   * Update an event by UUID within organization
   *
   * Supports partial updates - only provided fields will be updated.
   * Use this for Step 2 of progressive creation or general event updates.
   */
  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdateEventDto,
  ): Promise<EventEntity> {
    const event = await this.findByUuidOrFail(uuid, organizationUuid);
    const organization = await this.requireOrganization(organizationUuid);

    const updateData: Partial<EventEntity> = {};

    // Handle name update with duplicate check
    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();

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

    // Handle simple field updates
    if (dto.description !== undefined) {
      updateData.description = dto.description ?? null;
    }

    if (dto.learningLink !== undefined) {
      updateData.learning_link = dto.learningLink ?? null;
    }

    // Validate and convert reference UUIDs to IDs
    if (dto.eventTypeId !== undefined) {
      if (dto.eventTypeId === null || dto.eventTypeId === '') {
        updateData.event_type_id = null;
      } else {
        const eventType = await this.eventTypeService.findByUuid(dto.eventTypeId, organizationUuid);
        if (!eventType) {
          throw new BadRequestException(
            `Event type with UUID ${dto.eventTypeId} not found or inactive`,
          );
        }
        updateData.event_type_id = eventType.id;
      }
    }

    if (dto.eventLevelId !== undefined) {
      if (dto.eventLevelId === null || dto.eventLevelId === '') {
        updateData.event_level_id = null;
      } else {
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
    }

    if (dto.eventFormatId !== undefined) {
      if (dto.eventFormatId === null || dto.eventFormatId === '') {
        updateData.event_format_id = null;
      } else {
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
    }

    // Handle design update (including clearing)
    if (dto.designId !== undefined) {
      if (dto.designId === null || dto.designId === '') {
        updateData.design_id = null;
      } else {
        const design = await this.designService.findOneByUuid(dto.designId);
        if (!design) {
          throw new BadRequestException(`Design with UUID ${dto.designId} not found`);
        }
        updateData.design_id = design.id;
      }
    }

    await event.update(updateData);

    // Handle skills update if provided
    if (dto.skillIds !== undefined) {
      await this.updateEventSkills(event, dto.skillIds, organizationUuid);
    }

    return event.reload({
      include: [
        { model: EventTypeEntity, as: 'event_type', required: false },
        { model: EventLevelEntity, as: 'event_level', required: false },
        { model: EventFormatEntity, as: 'event_format', required: false },
        { model: DesignEntity, as: 'design', required: false },
        { model: SkillEntity, as: 'skills', required: false, through: { attributes: [] } },
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
   * Search events within organization by event name or design name
   */
  async searchEvents(
    organizationUuid: string,
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<EventEntity>> {
    const organization = await this.requireOrganization(organizationUuid);
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', where = {} } = options;

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
        {
          model: DesignEntity,
          as: 'design',
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: safeLimit,
      offset,
    });

    // Filter results client-side for event name or design name match
    const filteredRows = rows.filter((event) => {
      const query = searchQuery.toLowerCase();
      const eventNameMatch = event.name.toLowerCase().includes(query);
      const designNameMatch = event.design?.name?.toLowerCase().includes(query);
      return eventNameMatch || designNameMatch;
    });

    const totalPages = Math.ceil(count / safeLimit);

    return {
      data: filteredRows,
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

  /**
   * Validate optional event reference fields
   *
   * Only validates fields that are provided. Returns validated entities or undefined.
   */
  private async validateOptionalEventReferences(
    organizationUuid: string,
    dto: CreateEventDto | UpdateEventDto,
  ): Promise<{
    eventType?: EventTypeEntity;
    eventLevel?: EventLevelEntity;
    eventFormat?: EventFormatEntity;
    design?: DesignEntity;
  }> {
    const result: {
      eventType?: EventTypeEntity;
      eventLevel?: EventLevelEntity;
      eventFormat?: EventFormatEntity;
      design?: DesignEntity;
    } = {};

    // Validate event type if provided
    if (dto.eventTypeId) {
      const eventType = await this.eventTypeService.findByUuid(
        dto.eventTypeId,
        organizationUuid,
      );
      if (!eventType) {
        throw new BadRequestException(
          `Event type with UUID ${dto.eventTypeId} not found or inactive`,
        );
      }
      result.eventType = eventType;
    }

    // Validate event level if provided
    if (dto.eventLevelId) {
      const eventLevel = await this.eventLevelService.findByUuid(
        dto.eventLevelId,
        organizationUuid,
      );
      if (!eventLevel) {
        throw new BadRequestException(
          `Event level with UUID ${dto.eventLevelId} not found or inactive`,
        );
      }
      result.eventLevel = eventLevel;
    }

    // Validate event format if provided
    if (dto.eventFormatId) {
      const eventFormat = await this.eventFormatService.findByUuid(
        dto.eventFormatId,
        organizationUuid,
      );
      if (!eventFormat) {
        throw new BadRequestException(
          `Event format with UUID ${dto.eventFormatId} not found or inactive`,
        );
      }
      result.eventFormat = eventFormat;
    }

    // Validate design if provided
    if (dto.designId) {
      const design = await this.designService.findOneByUuid(dto.designId);
      if (!design) {
        throw new BadRequestException(`Design with UUID ${dto.designId} not found`);
      }
      result.design = design;
    }

    return result;
  }
}
