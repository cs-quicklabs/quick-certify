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
  EventParticipantService,
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
  EventParticipantEntity,
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
      EventParticipantEntity,
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
    EventParticipantService,
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
    EventParticipantService,
    EventRepository,
  ],
})
export class EventModule {}
