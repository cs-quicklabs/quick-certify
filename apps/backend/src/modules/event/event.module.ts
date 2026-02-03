import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  EventTypeController,
  EventLevelController,
  EventFormatController,
  EventController,
} from './controllers';
import { EventTypeService, EventLevelService, EventFormatService, EventService } from './services';
import { EventTypeEntity, EventLevelEntity, EventFormatEntity, EventEntity } from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';

@Module({
  imports: [
    SequelizeModule.forFeature([EventTypeEntity, EventLevelEntity, EventFormatEntity, EventEntity]),
    AuthModule,
    OrganizationModule,
  ],
  controllers: [EventTypeController, EventLevelController, EventFormatController, EventController],
  providers: [EventTypeService, EventLevelService, EventFormatService, EventService],
  exports: [EventTypeService, EventLevelService, EventFormatService, EventService],
})
export class EventModule {}
