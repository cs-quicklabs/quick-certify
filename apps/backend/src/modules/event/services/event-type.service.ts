import { ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModelStatic } from 'sequelize';
import { BaseNamedEntityService } from '@src/commons/base';
import { EventTypeEntity } from '@src/entities';
import { CreateEventTypeDto, UpdateEventTypeDto } from '../dtos';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { EventService } from './event.service';

@Injectable()
export class EventTypeService extends BaseNamedEntityService<
  EventTypeEntity,
  CreateEventTypeDto,
  UpdateEventTypeDto
> {
  protected readonly model: ModelStatic<EventTypeEntity>;
  protected readonly entityName = 'Event type';

  constructor(
    @InjectModel(EventTypeEntity) model: typeof EventTypeEntity,
    organizationService: OrganizationService,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
  ) {
    super(organizationService);
    this.model = model as ModelStatic<EventTypeEntity>;
  }

  override async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const entity = await this.findByUuid(uuid, organizationUuid);
    if (entity) {
      const count = await this.eventService.countActiveByTypeId(entity.id);
      if (count > 0) {
        throw new ConflictException(`Cannot delete: ${count} event(s) are using this event type`);
      }
    }
    return super.deleteByUuid(uuid, organizationUuid);
  }
}
