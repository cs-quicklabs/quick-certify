import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { PathwayEventEntity } from '@src/entities/pathway-event.entity';
import { EventEntity } from '@src/entities/event.entity';
import { PathwayEntity } from '@src/entities/pathway.entity';

export interface EventSyncItem {
  eventId: string;
  isFinal?: boolean;
}

@Injectable()
export class PathwayEventService {
  constructor(
    @InjectModel(PathwayEventEntity)
    private readonly pathwayEventModel: typeof PathwayEventEntity,
    @InjectModel(EventEntity)
    private readonly eventModel: typeof EventEntity,
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

    const events = await this.eventModel.findAll({
      where: {
        uuid: eventUuids,
        organization_id: organizationId,
        is_active: true,
      },
      ...(transaction && { transaction }),
    });

    if (events.length !== eventUuids.length) {
      const foundUuids = events.map((e) => e.uuid);
      const missingUuids = eventUuids.filter((uuid) => !foundUuids.includes(uuid));
      throw new BadRequestException(`Events not found or inactive: ${missingUuids.join(', ')}`);
    }

    const uuidToId = new Map(events.map((e) => [e.uuid, e.id]));

    const associations = eventItems.map((item, index) => ({
      pathway_id: pathway.id,
      event_id: uuidToId.get(item.eventId)!,
      order: index + 1,
      is_final: item.isFinal ?? false,
    }));

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
