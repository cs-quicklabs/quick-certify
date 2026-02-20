import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { PathwayEventEntity } from '@src/entities/pathway-event.entity';
import { EventEntity } from '@src/entities/event.entity';
import { PathwayEntity } from '@src/entities/pathway.entity';

@Injectable()
export class PathwayEventService {
  constructor(
    @InjectModel(PathwayEventEntity)
    private readonly pathwayEventModel: typeof PathwayEventEntity,
    @InjectModel(EventEntity)
    private readonly eventModel: typeof EventEntity,
  ) {}

  /**
   * Sync events for a pathway (removes existing and adds new with order)
   */
  async syncEvents(
    pathway: PathwayEntity,
    eventUuids: string[],
    organizationId: number,
    transaction?: Transaction,
  ): Promise<void> {
    await this.clearEvents(pathway.id, transaction);

    if (eventUuids.length === 0) {
      return;
    }

    await this.addEvents(pathway, eventUuids, organizationId, transaction);
  }

  /**
   * Add events to a pathway with order preserved from array index
   */
  async addEvents(
    pathway: PathwayEntity,
    eventUuids: string[],
    organizationId: number,
    transaction?: Transaction,
  ): Promise<void> {
    if (!eventUuids || eventUuids.length === 0) return;

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

    // Map UUIDs to IDs preserving order from the input array
    const uuidToId = new Map(events.map((e) => [e.uuid, e.id]));

    const associations = eventUuids.map((uuid, index) => ({
      pathway_id: pathway.id,
      event_id: uuidToId.get(uuid)!,
      order: index + 1,
    }));

    await this.pathwayEventModel.bulkCreate(associations, {
      fields: ['pathway_id', 'event_id', 'order'],
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
