import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from '@src/entities/user.entity';
import { RoleEntity } from '@src/entities/role.entity';
import { OrganizationEntity } from '@src/entities/organization.entity';
import { AuthModule } from '@src/modules/auth';

/**
 * User Module
 *
 * DIP: Imports AuthModule for PasswordService dependency
 */
@Module({
  imports: [
    SequelizeModule.forFeature([UserEntity, RoleEntity, OrganizationEntity]),
    AuthModule, // For PasswordService
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
