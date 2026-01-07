import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserTypeController } from './user-type.controller';
import { UserTypeService } from './user-type.service';
import { UserTypeEntity } from '@src/entities';

@Module({
  imports: [SequelizeModule.forFeature([UserTypeEntity])],
  controllers: [UserTypeController],
  providers: [UserTypeService],
  exports: [UserTypeService],
})
export class UserTypeModule {}
