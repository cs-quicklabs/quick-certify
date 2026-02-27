import { ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModelStatic } from 'sequelize';
import { BaseNamedEntityService } from '@src/commons/base';
import { EventLevelEntity } from '@src/entities';
import { CreateEventLevelDto, UpdateEventLevelDto } from '../dtos';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { EventService } from './event.service';

@Injectable()
export class EventLevelService extends BaseNamedEntityService<
  EventLevelEntity,
  CreateEventLevelDto,
  UpdateEventLevelDto
> {
  protected readonly model: ModelStatic<EventLevelEntity>;
  protected readonly entityName = 'Event level';

  constructor(
    @InjectModel(EventLevelEntity) model: typeof EventLevelEntity,
    organizationService: OrganizationService,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
  ) {
    super(organizationService);
    this.model = model as ModelStatic<EventLevelEntity>;
  }

  override async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const entity = await this.findByUuid(uuid, organizationUuid);
    if (entity) {
      const count = await this.eventService.countActiveByLevelId(entity.id);
      if (count > 0) {
        throw new ConflictException(`Cannot delete: ${count} event(s) are using this event level`);
      }
    }
    return super.deleteByUuid(uuid, organizationUuid);
  }
}
