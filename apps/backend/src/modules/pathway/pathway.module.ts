import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PathwayController } from './controllers/pathway.controller';
import { PathwayService } from './services/pathway.service';
import { PathwayEventService } from './services/pathway-event.service';
import { PathwayParticipantService } from './services/pathway-participant.service';
import {
  PathwayEntity,
  PathwayEventEntity,
  PathwayParticipantEntity,
  EventEntity,
  RecipientEntity,
} from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';
import { RecipientModule } from '../recipient/recipient.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PathwayEntity,
      PathwayEventEntity,
      PathwayParticipantEntity,
      EventEntity,
      RecipientEntity,
    ]),
    AuthModule,
    OrganizationModule,
    RecipientModule,
  ],
  controllers: [PathwayController],
  providers: [
    PathwayService,
    PathwayEventService,
    PathwayParticipantService,
  ],
  exports: [
    PathwayService,
    PathwayEventService,
    PathwayParticipantService,
  ],
})
export class PathwayModule {}
