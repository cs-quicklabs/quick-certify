import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PathwayController } from './pathway.controller';
import { PathwayService } from './pathway.service';
import { PathwayEventService } from './pathway-event.service';
import { PathwayParticipantService } from './pathway-participant.service';
import { PathwayEntity, PathwayEventEntity, PathwayParticipantEntity } from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';
import { RecipientModule } from '../recipient/recipient.module';
import { CredentialModule } from '../credential/credential.module';
import { EventModule } from '../event/event.module';
import { EmailService } from '@src/commons/services';

@Module({
  imports: [
    SequelizeModule.forFeature([PathwayEntity, PathwayEventEntity, PathwayParticipantEntity]),
    AuthModule,
    OrganizationModule,
    RecipientModule,
    CredentialModule,
    EventModule,
  ],
  controllers: [PathwayController],
  providers: [PathwayService, PathwayEventService, PathwayParticipantService, EmailService],
  exports: [PathwayService, PathwayEventService, PathwayParticipantService],
})
export class PathwayModule {}
