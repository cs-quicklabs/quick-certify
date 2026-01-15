import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserEntity, RoleEntity, OrganizationEntity } from '@src/entities';
import { StorageService } from '@src/commons/services';

@Module({
  imports: [SequelizeModule.forFeature([UserEntity, RoleEntity, OrganizationEntity])],
  controllers: [ProfileController],
  providers: [ProfileService, StorageService],
  exports: [ProfileService],
})
export class ProfileModule { }
