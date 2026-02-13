import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CredentialEntity } from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';
import { EventModule } from '../event';
import { RecipientModule } from '../recipient/recipient.module';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';

@Module({
  imports: [
    SequelizeModule.forFeature([CredentialEntity]),
    AuthModule,
    OrganizationModule,
    EventModule,
    RecipientModule,
  ],
  controllers: [CredentialController],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule {}
