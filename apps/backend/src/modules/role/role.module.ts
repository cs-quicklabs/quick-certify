import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleEntity } from '@src/entities/role.entity';

@Module({
  imports: [SequelizeModule.forFeature([RoleEntity])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}

