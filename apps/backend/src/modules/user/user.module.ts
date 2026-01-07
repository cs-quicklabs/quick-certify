import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity, UserTypeEntity, OrganizationEntity } from '@src/entities';
import { AuthModule } from '@src/modules/auth';

/**
 * User Module
 *
 * DIP: Imports AuthModule for PasswordService dependency
 */
@Module({
  imports: [
    SequelizeModule.forFeature([UserEntity, UserTypeEntity, OrganizationEntity]),
    AuthModule, // For PasswordService
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
