import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '@src/modules/auth';
import { EmailService } from '@src/commons/services';
import { OrganizationEntity, UserEntity } from '@src/entities';
import { RoleModule } from '../role/role.module';
/**
 * User Module
 *
 * DIP: Imports AuthModule for PasswordService dependency
 */
@Module({
  imports: [
    SequelizeModule.forFeature([UserEntity, OrganizationEntity]),
    AuthModule, // For PasswordService
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService, EmailService],
  exports: [UserService],
})
export class UserModule { }
