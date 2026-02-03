import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModelStatic } from 'sequelize';
import { BaseNamedEntityService } from '@src/commons/base';
import { EventLevelEntity } from '@src/entities';
import { CreateEventLevelDto, UpdateEventLevelDto } from '../dtos';
import { OrganizationService } from '@src/modules/organization/organization.service';

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
  ) {
    super(organizationService);
    this.model = model as ModelStatic<EventLevelEntity>;
  }
}
