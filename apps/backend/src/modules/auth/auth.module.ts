import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { SocialAuthController } from './social-auth.controller';
import { AuthService } from './auth.service';
import { PasswordService, TokenService, SessionService, GoogleOAuthService } from './services';
import { JwtAuthGuard, RolesGuard } from './guards';
import { EmailService } from '@src/commons/services';
import {
  UserEntity,
  RoleEntity,
  OrganizationEntity,
  SessionEntity,
  PasswordResetEntity,
} from '@src/entities';
import { OrganizationModule } from '../organization';

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
      RoleEntity,
      OrganizationEntity,
      SessionEntity,
      PasswordResetEntity,
    ]),
    OrganizationModule,
  ],
  controllers: [AuthController, SocialAuthController],
  providers: [
    // Core services (SRP - each has single responsibility)
    PasswordService,
    TokenService,
    SessionService,
    GoogleOAuthService,

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
export class AuthModule { }
