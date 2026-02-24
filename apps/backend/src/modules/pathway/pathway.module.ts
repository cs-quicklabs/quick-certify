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
} from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';
import { RecipientModule } from '../recipient/recipient.module';
import { CredentialModule } from '../credential/credential.module';
import { EmailService } from '@src/commons/services';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PathwayEntity,
      PathwayEventEntity,
      PathwayParticipantEntity,
      EventEntity,
    ]),
    AuthModule,
    OrganizationModule,
    RecipientModule,
    CredentialModule,
  ],
  controllers: [PathwayController],
  providers: [PathwayService, PathwayEventService, PathwayParticipantService, EmailService],
  exports: [PathwayService, PathwayEventService, PathwayParticipantService],
})
export class PathwayModule {}
