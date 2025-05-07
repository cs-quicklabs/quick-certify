import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '@/modules/user/user.module';
import { SessionModule } from '@/modules/session/session.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { SessionModel, UserResetTokenModel } from '@/models';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from './strategies';
import { AllConfigType } from '@/config/config.type';
import { OrganizationModule } from '../organization/organization.module';
import { RoleModule } from '../role/role.module';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [AuthController],
  imports: [
    forwardRef(() => UserModule),
    SequelizeModule.forFeature([SessionModel, UserResetTokenModel]),
    PassportModule,
    SessionModule,
    OrganizationModule,
    RoleModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AllConfigType>) => {
        return {
          secret: configService.get('auth.accessTokenSecret', { infer: true }),
          signOptions: {
            expiresIn: configService.getOrThrow('auth.accessTokenExpires', {
              infer: true,
            }),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
