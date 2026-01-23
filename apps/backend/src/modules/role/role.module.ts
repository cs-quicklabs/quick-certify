import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleService } from './role.service';
import { RoleEntity } from '@src/entities/role.entity';
import { RoleController } from './role.controller';

@Module({
  imports: [SequelizeModule.forFeature([RoleEntity])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
