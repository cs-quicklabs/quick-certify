import { Transaction } from 'sequelize';
import { PathwayEntity } from '@src/entities';
import { EventSyncItem } from '../pathway-event.service';

/**
 * Pathway Event Service Interface
 * SRP: Single responsibility for pathway-event association management
 */
export interface IPathwayEventService {
  /**
   * Sync events for a pathway (removes existing and adds new with order + isFinal)
   */
  syncEvents(
    pathway: PathwayEntity,
    eventItems: EventSyncItem[],
    organizationId: number,
    transaction?: Transaction,
  ): Promise<void>;

  /**
   * Add events to a pathway with order and isFinal preserved from array
   */
  addEvents(
    pathway: PathwayEntity,
    eventItems: EventSyncItem[],
    organizationId: number,
    transaction?: Transaction,
  ): Promise<void>;

  /**
   * Clear all events from a pathway
   */
  clearEvents(pathwayId: number, transaction?: Transaction): Promise<void>;
}
