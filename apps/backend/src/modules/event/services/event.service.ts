import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEntity } from '@src/entities/event.entity';
import { CreateEventDto, UpdateEventDto } from '../dtos';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { EventRepository } from '../repositories/event.repository';
import { EventSkillService } from './event-skill.service';
import { EventReferenceValidator } from '../validators/event-reference.validator';

/**
 * Event Service
 *
 * Handles event CRUD operations with support for progressive creation.
 * Refactored to follow SOLID principles:
 * - Single Responsibility: Only handles event business logic
 * - Dependencies: Uses Repository, Validator, and SkillService
 *
 * Progressive Creation Pattern:
 * - Step 1: Create event with minimal data (name + design)
 * - Step 2: Update with additional details (type, level, format, description, skills)
 */
@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventSkillService: EventSkillService,
    private readonly referenceValidator: EventReferenceValidator,
    private readonly organizationService: OrganizationService,
  ) {}

  /**
   * Find all active events for an organization
   */
  async findAll(
    organizationUuid: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<EventEntity>> {
    const organization = await this.getOrganization(organizationUuid);

    if (!organization) {
      return this.emptyPaginatedResult(options.limit || 10);
    }

    return this.eventRepository.findAll(organization.id, options);
  }

  /**
   * Find one event by UUID within organization
   */
  async findByUuid(uuid: string, organizationUuid: string): Promise<EventEntity | null> {
    const organization = await this.getOrganization(organizationUuid);
    if (!organization) return null;

    return this.eventRepository.findByUuid(uuid, organization.id);
  }

  /**
   * Create a new event
   * Supports restoring soft-deleted events with the same name
   */
  async create(organizationUuid: string, dto: CreateEventDto): Promise<EventEntity> {
    const organization = await this.requireOrganization(organizationUuid);
    const normalizedName = dto.name.trim();

    // Validate required design
    if (!dto.designId) {
      throw new BadRequestException('Design ID is required');
    }

    // Validate references
    const refs = await this.referenceValidator.validateOptional(organizationUuid, {
      eventTypeId: dto.eventTypeId,
      eventLevelId: dto.eventLevelId,
      eventFormatId: dto.eventFormatId,
      designId: dto.designId,
    });

    // Check for existing event
    const existingEvent = await this.eventRepository.findByName(normalizedName, organization.id);

    if (existingEvent) {
      return this.restoreOrThrow(existingEvent, normalizedName, dto, refs, organizationUuid);
    }

    // Create new event
    const event = await this.eventRepository.create({
      organization_id: organization.id,
      name: normalizedName,
      description: dto.description ?? null,
      learning_link: dto.learningLink ?? null,
      event_type_id: refs.eventType?.id ?? null,
      event_level_id: refs.eventLevel?.id ?? null,
      event_format_id: refs.eventFormat?.id ?? null,
      design_id: refs.design?.id ?? null,
      is_active: true,
    });

    // Associate skills if provided
    if (dto.skillIds?.length) {
      await this.eventSkillService.addSkills(event, dto.skillIds, organizationUuid);
    }

    return this.eventRepository.reload(event);
  }

  /**
   * Update an event by UUID
   * Supports partial updates
   */
  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdateEventDto,
  ): Promise<EventEntity> {
    const event = await this.requireEvent(uuid, organizationUuid);

    const updateData: Partial<EventEntity> = {};

    // Handle name update with duplicate check
    if (dto.name !== undefined) {
      updateData.name = await this.validateNameUpdate(dto.name, event.organization_id, event.id);
    }

    // Handle simple field updates
    if (dto.description !== undefined) {
      updateData.description = dto.description ?? null;
    }

    if (dto.learningLink !== undefined) {
      updateData.learning_link = dto.learningLink ?? null;
    }

    // Handle reference updates
    if (dto.eventTypeId !== undefined) {
      const eventType = await this.referenceValidator.validateEventType(
        dto.eventTypeId,
        organizationUuid,
      );
      updateData.event_type_id = eventType?.id ?? null;
    }

    if (dto.eventLevelId !== undefined) {
      const eventLevel = await this.referenceValidator.validateEventLevel(
        dto.eventLevelId,
        organizationUuid,
      );
      updateData.event_level_id = eventLevel?.id ?? null;
    }

    if (dto.eventFormatId !== undefined) {
      const eventFormat = await this.referenceValidator.validateEventFormat(
        dto.eventFormatId,
        organizationUuid,
      );
      updateData.event_format_id = eventFormat?.id ?? null;
    }

    if (dto.designId !== undefined) {
      const design = await this.referenceValidator.validateDesign(dto.designId);
      updateData.design_id = design?.id ?? null;
    }

    // Apply updates
    await this.eventRepository.update(event, updateData);

    // Handle skills update if provided
    if (dto.skillIds !== undefined) {
      await this.eventSkillService.syncSkills(event, dto.skillIds, organizationUuid);
    }

    return this.eventRepository.reload(event);
  }

  /**
   * Soft delete an event
   */
  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const event = await this.requireEvent(uuid, organizationUuid);
    await this.eventRepository.softDelete(event);
    return true;
  }

  /**
   * Search events by name or design name
   * Note: Currently filters results client-side after DB query
   */
  async searchEvents(
    organizationUuid: string,
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<EventEntity>> {
    // First get paginated results
    const result = await this.findAll(organizationUuid, options);

    // Filter by search query (event name or design name)
    const query = searchQuery.toLowerCase();
    const filteredData = result.data.filter((event) => {
      const eventNameMatch = event.name.toLowerCase().includes(query);
      const designNameMatch = event.design?.name?.toLowerCase().includes(query);
      return eventNameMatch || designNameMatch;
    });

    return {
      ...result,
      data: filteredData,
    };
  }

  // Private helper methods

  private async getOrganization(uuid: string) {
    return this.organizationService.findByUuid(uuid);
  }

  private async requireOrganization(uuid: string) {
    const org = await this.getOrganization(uuid);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  private async requireEvent(uuid: string, organizationUuid: string): Promise<EventEntity> {
    const event = await this.findByUuid(uuid, organizationUuid);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  private async validateNameUpdate(
    name: string,
    organizationId: number,
    excludeId: number,
  ): Promise<string> {
    const normalizedName = name.trim();

    const existing = await this.eventRepository.findByName(
      normalizedName,
      organizationId,
      excludeId,
    );

    if (existing) {
      throw new ConflictException(`Event "${normalizedName}" already exists in this organization`);
    }

    return normalizedName;
  }

  private async restoreOrThrow(
    existingEvent: EventEntity,
    normalizedName: string,
    dto: CreateEventDto,
    refs: {
      eventType?: { id: number };
      eventLevel?: { id: number };
      eventFormat?: { id: number };
      design?: { id: number };
    },
    organizationUuid: string,
  ): Promise<EventEntity> {
    if (existingEvent.is_active) {
      throw new ConflictException(`Event "${normalizedName}" already exists in this organization`);
    }

    // Restore soft-deleted event with new values
    const updateData: Partial<EventEntity> = {
      is_active: true,
    };

    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.learningLink !== undefined) updateData.learning_link = dto.learningLink;
    if (refs.eventType) updateData.event_type_id = refs.eventType.id;
    if (refs.eventLevel) updateData.event_level_id = refs.eventLevel.id;
    if (refs.eventFormat) updateData.event_format_id = refs.eventFormat.id;
    if (refs.design) updateData.design_id = refs.design.id;

    await this.eventRepository.update(existingEvent, updateData);

    // Associate skills if provided
    if (dto.skillIds?.length) {
      await this.eventSkillService.addSkills(existingEvent, dto.skillIds, organizationUuid);
    }

    return this.eventRepository.reload(existingEvent);
  }

  private emptyPaginatedResult(limit: number): PaginatedResult<EventEntity> {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}
