import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserEntity, RoleEntity } from '@src/entities';

@Module({
  imports: [SequelizeModule.forFeature([UserEntity, RoleEntity])],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule { }
