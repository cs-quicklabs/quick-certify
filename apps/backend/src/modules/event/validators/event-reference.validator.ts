import { Injectable, BadRequestException } from '@nestjs/common';
import { EventTypeEntity } from '@src/entities/event-type.entity';
import { EventLevelEntity } from '@src/entities/event-level.entity';
import { EventFormatEntity } from '@src/entities/event-format.entity';
import { DesignEntity } from '@src/entities/design.entity';
import { EventTypeService } from '../services/event-type.service';
import { EventLevelService } from '../services/event-level.service';
import { EventFormatService } from '../services/event-format.service';
import { DesignService } from '@src/modules/design/design.services';

/**
 * Validated references result
 */
export interface ValidatedEventReferences {
  eventType?: EventTypeEntity;
  eventLevel?: EventLevelEntity;
  eventFormat?: EventFormatEntity;
  design?: DesignEntity;
}

/**
 * Event Reference Validator
 *
 * Validates and retrieves event reference entities.
 * Centralizes validation logic to avoid duplication.
 *
 * Single Responsibility: Validate event references only
 */
@Injectable()
export class EventReferenceValidator {
  constructor(
    private readonly eventTypeService: EventTypeService,
    private readonly eventLevelService: EventLevelService,
    private readonly eventFormatService: EventFormatService,
    private readonly designService: DesignService,
  ) {}

  /**
   * Validate optional event references
   * Only validates fields that are provided (not undefined)
   */
  async validateOptional(
    organizationUuid: string,
    refs: {
      eventTypeId?: string;
      eventLevelId?: string;
      eventFormatId?: string;
      designId?: string;
    },
  ): Promise<ValidatedEventReferences> {
    const result: ValidatedEventReferences = {};

    if (refs.eventTypeId) {
      result.eventType = await this.validateEventType(refs.eventTypeId, organizationUuid);
    }

    if (refs.eventLevelId) {
      result.eventLevel = await this.validateEventLevel(refs.eventLevelId, organizationUuid);
    }

    if (refs.eventFormatId) {
      result.eventFormat = await this.validateEventFormat(refs.eventFormatId, organizationUuid);
    }

    if (refs.designId) {
      result.design = await this.validateDesign(refs.designId);
    }

    return result;
  }

  /**
   * Validate event type reference
   * Returns null if null/empty string provided (for clearing reference)
   */
  async validateEventType(
    eventTypeId: string | null | undefined,
    organizationUuid: string,
  ): Promise<EventTypeEntity | null> {
    if (eventTypeId === null || eventTypeId === '') {
      return null;
    }

    const eventType = await this.eventTypeService.findByUuid(eventTypeId, organizationUuid);
    if (!eventType) {
      throw new BadRequestException(`Event type with UUID ${eventTypeId} not found or inactive`);
    }
    return eventType;
  }

  /**
   * Validate event level reference
   * Returns null if null/empty string provided (for clearing reference)
   */
  async validateEventLevel(
    eventLevelId: string | null | undefined,
    organizationUuid: string,
  ): Promise<EventLevelEntity | null> {
    if (eventLevelId === null || eventLevelId === '') {
      return null;
    }

    const eventLevel = await this.eventLevelService.findByUuid(eventLevelId, organizationUuid);
    if (!eventLevel) {
      throw new BadRequestException(`Event level with UUID ${eventLevelId} not found or inactive`);
    }
    return eventLevel;
  }

  /**
   * Validate event format reference
   * Returns null if null/empty string provided (for clearing reference)
   */
  async validateEventFormat(
    eventFormatId: string | null | undefined,
    organizationUuid: string,
  ): Promise<EventFormatEntity | null> {
    if (eventFormatId === null || eventFormatId === '') {
      return null;
    }

    const eventFormat = await this.eventFormatService.findByUuid(eventFormatId, organizationUuid);
    if (!eventFormat) {
      throw new BadRequestException(
        `Event format with UUID ${eventFormatId} not found or inactive`,
      );
    }
    return eventFormat;
  }

  /**
   * Validate design reference
   * Returns null if null/empty string provided (for clearing reference)
   */
  async validateDesign(designId: string | null | undefined): Promise<DesignEntity | null> {
    if (designId === null || designId === '') {
      return null;
    }

    const design = await this.designService.findOneByUuid(designId);
    if (!design) {
      throw new BadRequestException(`Design with UUID ${designId} not found`);
    }
    return design;
  }
}
