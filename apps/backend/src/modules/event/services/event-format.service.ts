import { ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModelStatic } from 'sequelize';
import { BaseNamedEntityService } from '@src/commons/base';
import { EventFormatEntity } from '@src/entities';
import { CreateEventFormatDto, UpdateEventFormatDto } from '../dtos';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { EventService } from './event.service';

@Injectable()
export class EventFormatService extends BaseNamedEntityService<
  EventFormatEntity,
  CreateEventFormatDto,
  UpdateEventFormatDto
> {
  protected readonly model: ModelStatic<EventFormatEntity>;
  protected readonly entityName = 'Event format';

  constructor(
    @InjectModel(EventFormatEntity) model: typeof EventFormatEntity,
    organizationService: OrganizationService,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
  ) {
    super(organizationService);
    this.model = model as ModelStatic<EventFormatEntity>;
  }

  override async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const entity = await this.findByUuid(uuid, organizationUuid);
    if (entity) {
      const count = await this.eventService.countActiveByFormatId(entity.id);
      if (count > 0) {
        throw new ConflictException(`Cannot delete: ${count} event(s) are using this event format`);
      }
    }
    return super.deleteByUuid(uuid, organizationUuid);
  }
}
