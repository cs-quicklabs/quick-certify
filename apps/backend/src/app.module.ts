import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app/app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './database/config/database.config';
import { authConfig, mailerConfig, smsConfig, appConfig } from './config';
import storageConfig from './config/storage.config';
import { AllConfigType } from './config/config.type';
import * as path from 'path';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './database/sequelize-config.service';
import { MailerModule } from '@crownstack/mailer';
// import { SmsModule } from '@crownstack/sms';
import { EmailService } from '@src/commons/services';

// Modules
import { AuthModule, JwtAuthGuard, TokenService, SessionService } from './modules/auth';
import { UserModule } from './modules/user';
import { OrganizationModule } from './modules/organization';
import { RoleModule } from './modules/role';
import { FileModule } from './modules/file';
import { SkillModule } from './modules/skill';
import { EventModule } from './modules/event';

// Entities for guards
import { SequelizeModule as SequelizeFeatureModule } from '@nestjs/sequelize';
import { SessionEntity, UserEntity } from './entities';
import { ProfileModule } from './modules/profile/profile.module';
import { DesignModule } from './modules/design/design.module';

/**
 * Application Root Module
 *
 * DIP: Uses abstractions via module imports
 * SRP: Configuration and wiring only
 */
@Module({
  imports: [
    // Configuration - loads from project root .env
    ConfigModule.forRoot({
      envFilePath: [
        path.resolve(process.cwd(), '.env'),           // Root .env (when running from root)
        path.resolve(__dirname, '../../../.env'),      // Root .env (when running from apps/backend)
        path.resolve(__dirname, '../../.env'),         // Fallback
      ],
      load: [appConfig, databaseConfig, authConfig, mailerConfig, smsConfig, storageConfig],
      isGlobal: true,
    }),

    // Database
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),

    // Register entities for global guards
    SequelizeFeatureModule.forFeature([SessionEntity, UserEntity]),

    // Mailer Package (only for sending)
    MailerModule.forRootAsync({
      isGlobal: true,
      useFactory: (...args: unknown[]) => {
        const configService = args[0] as ConfigService<AllConfigType>;
        const mailerCfg = configService.getOrThrow('mailer', { infer: true });
        return {
          host: mailerCfg.host,
          port: mailerCfg.port,
          secure: mailerCfg.secure,
          auth: {
            user: mailerCfg.user,
            pass: mailerCfg.pass,
          },
          defaultFrom: mailerCfg.defaultFrom,
          previewEmail: mailerCfg.previewEmail,
        };
      },
      inject: [ConfigService],
    }),

    // TODO: Disabled for now
    // SMS Package (only for sending)
    // SmsModule.forRootAsync({
    //   isGlobal: true,
    //   useFactory: (configService: ConfigService<AllConfigType>) => {
    //     const smsCfg = configService.getOrThrow('sms', { infer: true });
    //     return {
    //       accountSid: smsCfg.accountSid,
    //       authToken: smsCfg.authToken,
    //       fromNumber: smsCfg.fromNumber,
    //       previewMode: smsCfg.previewMode,
    //     };
    //   },
    //   inject: [ConfigService],
    // }),

    // Feature Modules
    AuthModule,
    UserModule,
    OrganizationModule,
    ProfileModule,
    RoleModule,
    FileModule,
    SkillModule,
    EventModule,
    DesignModule
  ],
  controllers: [AppController],
  providers: [
    EmailService,
    // Services needed by global guard
    TokenService,
    SessionService,
    // Global JWT Auth Guard - protects all routes by default
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [EmailService],
})
export class AppModule { }
