import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '@/modules/user/user.module';
import { SessionModule } from '@/modules/session/session.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { SessionModel } from '@/models';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from './strategies';
import { AllConfigType } from '@/config/config.type';

@Module({
  controllers: [AuthController],
  imports: [
    forwardRef(() => UserModule),
    SequelizeModule.forFeature([SessionModel]),
    PassportModule,
    SessionModule,
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
