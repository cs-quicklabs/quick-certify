import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  EventTypeController,
  EventLevelController,
  EventFormatController,
  EventController,
} from './controllers';
import { EventTypeService, EventLevelService, EventFormatService, EventService } from './services';
import { EventTypeEntity, EventLevelEntity, EventFormatEntity, EventEntity, EventSkillEntity, SkillEntity } from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';
import { DesignModule } from '../design/design.module';

@Module({
  imports: [
    SequelizeModule.forFeature([EventTypeEntity, EventLevelEntity, EventFormatEntity, EventEntity, EventSkillEntity, SkillEntity]),
    AuthModule,
    OrganizationModule,
    DesignModule,
  ],
  controllers: [EventTypeController, EventLevelController, EventFormatController, EventController],
  providers: [EventTypeService, EventLevelService, EventFormatService, EventService],
  exports: [EventTypeService, EventLevelService, EventFormatService, EventService],
})
export class EventModule { }
