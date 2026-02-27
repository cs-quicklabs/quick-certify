import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationEntity, RoleEntity, UserEntity } from '@src/entities';
import { FileModule } from '../file';
import { EmailService } from '@src/commons/services';

@Module({
  imports: [
    SequelizeModule.forFeature([OrganizationEntity, RoleEntity, UserEntity]),
    FileModule, // Provides StorageService
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, EmailService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
