import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transaction } from 'sequelize';
import { EventEntity } from '@src/entities/event.entity';
import { CreateEventDto, UpdateEventDto, EventFilterDto } from '../dtos';
import { PaginatedResult } from '@src/commons/base';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { EventRepository, EventFindAllOptions } from '../repositories/event.repository';
import { EventSkillService } from './event-skill.service';
import { EventReferenceValidator } from '../validators/event-reference.validator';
import { OrganizationEntity } from '@src/entities';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventSkillService: EventSkillService,
    private readonly referenceValidator: EventReferenceValidator,
    private readonly organizationService: OrganizationService,
  ) {}

  // ─── Public API ────────────────────────────────────────────────────────────

  async findAll(
    organizationIdentifier: string,
    filters: EventFilterDto = {},
    orgFromRequest?: OrganizationEntity,
  ): Promise<PaginatedResult<EventEntity>> {
    const organization = await this.resolveOrg(organizationIdentifier, orgFromRequest);
    if (!organization) return this.emptyPaginatedResult(filters.limit || 10);

    const options: EventFindAllOptions = {
      ...filters,
      typeUuids: this.parseUuidList(filters.typeIds),
      levelUuids: this.parseUuidList(filters.levelIds),
      formatUuids: this.parseUuidList(filters.formatIds),
    };

    return this.eventRepository.findAll(organization.id, options);
  }

  async findByUuid(
    uuid: string,
    organizationUuid: string,
    orgFromRequest?: OrganizationEntity,
  ): Promise<EventEntity | null> {
    const organization = await this.resolveOrg(organizationUuid, orgFromRequest);
    if (!organization) return null;
    return this.eventRepository.findByUuid(uuid, organization.id);
  }

  async findActiveByUuids(
    uuids: string[],
    organizationId: number,
    transaction?: Transaction,
  ): Promise<EventEntity[]> {
    if (uuids.length === 0) return [];
    return this.eventRepository.findActiveByUuids(uuids, organizationId, transaction);
  }

  async create(organizationUuid: string, dto: CreateEventDto): Promise<EventEntity> {
    const organization = await this.resolveOrg(organizationUuid, undefined, true);
    const normalizedName = dto.name.trim();
    //validate
    if (!dto.designId) throw new BadRequestException('Design ID is required');

    const refs = await this.referenceValidator.validateOptional(organizationUuid, {
      eventTypeId: dto.eventTypeId,
      eventLevelId: dto.eventLevelId,
      eventFormatId: dto.eventFormatId,
      designId: dto.designId,
    });

    const existingEvent = await this.eventRepository.findByName(normalizedName, organization.id);
    if (existingEvent) {
      return this.restoreEvent(existingEvent, normalizedName, dto, refs, organizationUuid);
    }

    const sequelize = this.eventRepository.getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const event = await this.eventRepository.create(
        {
          organization_id: organization.id,
          name: normalizedName,
          description: dto.description ?? null,
          learning_link: dto.learningLink ?? null,
          event_type_id: refs.eventType!.id,
          event_level_id: refs.eventLevel!.id,
          event_format_id: refs.eventFormat!.id,
          design_id: refs.design?.id ?? null,
          duration_type: dto.durationType ?? null,
          duration_value: dto.durationValue ?? null,
          is_active: true,
        },
        transaction,
      );

      if (dto.skillIds?.length) {
        await this.eventSkillService.addSkills(event, dto.skillIds, organizationUuid, transaction);
      }

      await transaction.commit();
      return this.eventRepository.reload(event);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdateEventDto,
  ): Promise<EventEntity> {
    const event = await this.requireEvent(uuid, organizationUuid);
    const updateData: Partial<EventEntity> = {};

    if (dto.name !== undefined) {
      updateData.name = await this.validateNameUpdate(dto.name, event.organization_id, event.id);
    }
    if (dto.description !== undefined) updateData.description = dto.description ?? null;
    if (dto.learningLink !== undefined) updateData.learning_link = dto.learningLink ?? null;
    if (dto.durationType !== undefined) updateData.duration_type = dto.durationType ?? null;
    if (dto.durationValue !== undefined) updateData.duration_value = dto.durationValue ?? null;

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

    const sequelize = this.eventRepository.getSequelize();
    const transaction = await sequelize.transaction();

    try {
      await this.eventRepository.update(event, updateData, transaction);
      if (dto.skillIds !== undefined) {
        await this.eventSkillService.syncSkills(event, dto.skillIds, organizationUuid, transaction);
      }
      await transaction.commit();
      return this.eventRepository.reload(event);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const event = await this.requireEvent(uuid, organizationUuid);

    const isLinked = await this.eventRepository.isLinkedToPathway(event.id);
    if (isLinked) {
      throw new ConflictException(
        'This event is linked to one or more pathways. Remove it from all pathways before deleting.',
      );
    }

    await this.eventRepository.softDelete(event);
    return true;
  }

  /**
   * Check whether any active event references the given design (by PK)
   */
  async hasActiveEventsForDesign(designId: number): Promise<boolean> {
    return this.eventRepository.existsByDesignId(designId);
  }

  async countActiveByTypeId(typeId: number): Promise<number> {
    return this.eventRepository.countActiveByTypeId(typeId);
  }

  async countActiveByLevelId(levelId: number): Promise<number> {
    return this.eventRepository.countActiveByLevelId(levelId);
  }

  async countActiveByFormatId(formatId: number): Promise<number> {
    return this.eventRepository.countActiveByFormatId(formatId);
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   * Resolves organization from request or DB.
   * Pass required=true to throw NotFoundException if not found.
   */
  private async resolveOrg(
    identifier: string,
    orgFromRequest: OrganizationEntity | undefined,
    required: true,
  ): Promise<OrganizationEntity>;
  private async resolveOrg(
    identifier: string,
    orgFromRequest?: OrganizationEntity,
    required?: false,
  ): Promise<OrganizationEntity | null>;
  private async resolveOrg(
    identifier: string,
    orgFromRequest?: OrganizationEntity,
    required = false,
  ): Promise<OrganizationEntity | null> {
    const org = orgFromRequest ?? (await this.organizationService.resolveOrganization(identifier));
    if (!org && required) throw new NotFoundException('Organization not found');
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
      true, // Only check active events for name conflicts
    );
    if (existing)
      throw new ConflictException(`Event "${normalizedName}" already exists in this organization`);
    return normalizedName;
  }

  private async restoreEvent(
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

    const sequelize = this.eventRepository.getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const updateData: Partial<EventEntity> = { is_active: true };

      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.learningLink !== undefined) updateData.learning_link = dto.learningLink;
      if (dto.durationType !== undefined) updateData.duration_type = dto.durationType;
      if (dto.durationValue !== undefined) updateData.duration_value = dto.durationValue;
      if (refs.eventType) updateData.event_type_id = refs.eventType.id;
      if (refs.eventLevel) updateData.event_level_id = refs.eventLevel.id;
      if (refs.eventFormat) updateData.event_format_id = refs.eventFormat.id;
      if (refs.design) updateData.design_id = refs.design.id;

      await this.eventRepository.update(existingEvent, updateData, transaction);

      if (dto.skillIds?.length) {
        await this.eventSkillService.addSkills(
          existingEvent,
          dto.skillIds,
          organizationUuid,
          transaction,
        );
      }

      await transaction.commit();
      return this.eventRepository.reload(existingEvent);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private parseUuidList(value?: string): string[] | undefined {
    if (!value?.trim()) return undefined;
    return value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  private emptyPaginatedResult(limit: number): PaginatedResult<EventEntity> {
    return {
      data: [],
      meta: { total: 0, page: 1, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    };
  }
}
