import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationEntity, RoleEntity } from '@src/entities';
import { FileModule } from '../file';

@Module({
  imports: [
    SequelizeModule.forFeature([OrganizationEntity, RoleEntity]),
    FileModule, // Provides StorageService
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
