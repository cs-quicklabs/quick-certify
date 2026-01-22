import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from '@src/entities/user.entity';
import { AuthModule } from '@src/modules/auth';
import { EmailService } from '@src/commons/services';
import { RoleModule } from '../role';
import { OrganizationModule } from '../organization';
/**
 * User Module
 *
 * DIP: Imports AuthModule for PasswordService dependency
 * Uses forwardRef to avoid circular dependency with AuthModule
 */
@Module({
  imports: [
    SequelizeModule.forFeature([UserEntity]),
    forwardRef(() => AuthModule), // For PasswordService - forwardRef to avoid circular dependency
    RoleModule,
    OrganizationModule,
  ],
  controllers: [UserController],
  providers: [UserService, EmailService],
  exports: [UserService],
})
export class UserModule { }
