import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModelStatic } from 'sequelize';
import { BaseNamedEntityService } from '@src/commons/base';
import { EventTypeEntity } from '@src/entities';
import { CreateEventTypeDto, UpdateEventTypeDto } from '../dtos';
import { OrganizationService } from '@src/modules/organization/organization.service';

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
  ) {
    super(organizationService);
    this.model = model as ModelStatic<EventTypeEntity>;
  }
}
