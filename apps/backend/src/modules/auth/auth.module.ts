import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { SocialAuthController } from './social-auth.controller';
import { SocialAuthController } from './social-auth.controller';
import { AuthService } from './auth.service';
import {
  PasswordService,
  TokenService,
  SessionService,
  GoogleOAuthService,
  PasswordResetService,
} from './services';
import { JwtAuthGuard, RolesGuard } from './guards';
import { EmailService } from '@src/commons/services';
import { SessionEntity, PasswordResetEntity } from '@src/entities';
import { OrganizationModule } from '../organization';
import { UserModule } from '../user';
import { RoleModule } from '../role';

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
    SequelizeModule.forFeature([SessionEntity, PasswordResetEntity]),
    OrganizationModule,
    forwardRef(() => UserModule),
    RoleModule,
  ],
  controllers: [AuthController, SocialAuthController],
  providers: [
    // Core services (SRP - each has single responsibility)
    PasswordService,
    TokenService,
    SessionService,
    GoogleOAuthService,
    PasswordResetService,

    // Orchestrator service
    AuthService,

    // Guards
    JwtAuthGuard,
    RolesGuard,

    // External services
    EmailService,
  ],
  exports: [
    AuthService,
    PasswordService,
    TokenService,
    SessionService,
    PasswordResetService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule { }
