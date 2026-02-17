import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CredentialEntity, CredentialIssueBatchEntity } from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';
import { EventModule } from '../event';
import { RecipientModule } from '../recipient/recipient.module';
import { DesignModule } from '../design/design.module';
import { FileModule } from '../file/file.module';
import { EmailService } from '@src/commons/services';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';
import { CertificateGenerationService } from './services/certificate-generation.service';
import { BatchWorkerService } from './services/batch-worker.service';
import { CredentialEmailService } from './services/credential-email.service';

@Module({
  imports: [
    SequelizeModule.forFeature([CredentialEntity, CredentialIssueBatchEntity]),
    AuthModule,
    OrganizationModule,
    EventModule,
    RecipientModule,
    DesignModule,
    FileModule,
  ],
  controllers: [CredentialController],
  providers: [
    CredentialService,
    CertificateGenerationService,
    BatchWorkerService,
    CredentialEmailService,
    EmailService,
  ],
  exports: [CredentialService],
})
export class CredentialModule {}
