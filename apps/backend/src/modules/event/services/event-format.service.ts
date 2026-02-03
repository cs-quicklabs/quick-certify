import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModelStatic } from 'sequelize';
import { BaseNamedEntityService } from '@src/commons/base';
import { EventFormatEntity } from '@src/entities';
import { CreateEventFormatDto, UpdateEventFormatDto } from '../dtos';
import { OrganizationService } from '@src/modules/organization/organization.service';

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
  ) {
    super(organizationService);
    this.model = model as ModelStatic<EventFormatEntity>;
  }
}
