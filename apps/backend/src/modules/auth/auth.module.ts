import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService, TokenService, SessionService } from './services';
import { JwtAuthGuard, RolesGuard } from './guards';
import { EmailService } from '@src/commons/services';
import {
  UserEntity,
  UserTypeEntity,
  OrganizationEntity,
  SessionEntity,
  PasswordResetEntity,
} from '@src/entities';

/**
 * Auth Module
 *
 * Provides authentication and authorization services following SOLID:
 * - SRP: Each service has a single responsibility
 * - OCP: Extendable via new services without modifying existing ones
 * - DIP: Controllers depend on service abstractions
 */
@Module({
  imports: [
    SequelizeModule.forFeature([
      UserEntity,
      UserTypeEntity,
      OrganizationEntity,
      SessionEntity,
      PasswordResetEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    // Core services (SRP - each has single responsibility)
    PasswordService,
    TokenService,
    SessionService,

    // Orchestrator service
    AuthService,

    // Guards
    JwtAuthGuard,
    RolesGuard,

    // External services
    EmailService,
  ],
  exports: [AuthService, PasswordService, TokenService, SessionService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
