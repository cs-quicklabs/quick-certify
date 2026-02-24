import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { PathwayEventEntity, PathwayEntity } from '@src/entities';
import { EventService } from '@src/modules/event/services/event.service';

export interface EventSyncItem {
  eventId: string;
  isFinal?: boolean;
}

@Injectable()
export class PathwayEventService {
  constructor(
    @InjectModel(PathwayEventEntity)
    private readonly pathwayEventModel: typeof PathwayEventEntity,
    private readonly eventService: EventService,
  ) {}

  /**
   * Sync events for a pathway (removes existing and adds new with order + isFinal)
   */
  async syncEvents(
    pathway: PathwayEntity,
    eventItems: EventSyncItem[],
    organizationId: number,
    transaction?: Transaction,
  ): Promise<void> {
    await this.clearEvents(pathway.id, transaction);

    if (eventItems.length === 0) {
      return;
    }

    await this.addEvents(pathway, eventItems, organizationId, transaction);
  }

  /**
   * Add events to a pathway with order and isFinal preserved from array
   */
  async addEvents(
    pathway: PathwayEntity,
    eventItems: EventSyncItem[],
    organizationId: number,
    transaction?: Transaction,
  ): Promise<void> {
    if (!eventItems || eventItems.length === 0) return;

    const eventUuids = eventItems.map((e) => e.eventId);

    const events = await this.eventService.findActiveByUuids(
      eventUuids,
      organizationId,
      transaction,
    );

    if (events.length !== eventUuids.length) {
      const foundUuids = events.map((e) => e.uuid);
      const missingUuids = eventUuids.filter((uuid) => !foundUuids.includes(uuid));
      throw new BadRequestException(`Events not found or inactive: ${missingUuids.join(', ')}`);
    }

    const uuidToId = new Map(events.map((e) => [e.uuid, e.id]));

    const associations = eventItems.map((item, index) => {
      const eventId = uuidToId.get(item.eventId);
      if (eventId === undefined) {
        throw new BadRequestException(`Event not found: ${item.eventId}`);
      }
      return {
        pathway_id: pathway.id,
        event_id: eventId,
        order: index + 1,
        is_final: item.isFinal ?? false,
      };
    });

    await this.pathwayEventModel.bulkCreate(associations, {
      fields: ['pathway_id', 'event_id', 'order', 'is_final'],
      ...(transaction && { transaction }),
    });
  }

  /**
   * Clear all events from a pathway
   */
  async clearEvents(pathwayId: number, transaction?: Transaction): Promise<void> {
    await this.pathwayEventModel.destroy({
      where: { pathway_id: pathwayId },
      ...(transaction && { transaction }),
    });
  }
}
