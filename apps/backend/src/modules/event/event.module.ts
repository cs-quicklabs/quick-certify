import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  EventTypeController,
  EventLevelController,
  EventFormatController,
  EventController,
} from './controllers';
import {
  EventTypeService,
  EventLevelService,
  EventFormatService,
  EventService,
  EventSkillService,
} from './services';
import { EventRepository } from './repositories/event.repository';
import { EventReferenceValidator } from './validators/event-reference.validator';
import {
  EventTypeEntity,
  EventLevelEntity,
  EventFormatEntity,
  EventEntity,
  EventSkillEntity,
  SkillEntity,
} from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';
import { DesignModule } from '../design/design.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      EventTypeEntity,
      EventLevelEntity,
      EventFormatEntity,
      EventEntity,
      EventSkillEntity,
      SkillEntity,
    ]),
    AuthModule,
    OrganizationModule,
    DesignModule,
  ],
  controllers: [EventTypeController, EventLevelController, EventFormatController, EventController],
  providers: [
    // Services
    EventTypeService,
    EventLevelService,
    EventFormatService,
    EventService,
    EventSkillService,
    // Repository
    EventRepository,
    // Validator
    EventReferenceValidator,
  ],
  exports: [
    EventTypeService,
    EventLevelService,
    EventFormatService,
    EventService,
    EventSkillService,
    EventRepository,
  ],
})
export class EventModule {}
