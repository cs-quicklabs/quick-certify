import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { Request } from 'express';
import Helpers from '@/utils/helper';
import { SessionService } from '@/modules/session/session.service';

export const JWT_REFRESH_TOKEN_STRATEGY_NAME = 'jwt-refresh-token';
export const JWT_REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

type JwtRefreshPayloadType = {
  sessionId: number;
  hash: string;
  iat: number;
  exp: number;
};

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_TOKEN_STRATEGY_NAME
) {
  constructor(
    configService: ConfigService<AllConfigType>,
    private readonly sessionService: SessionService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.[JWT_REFRESH_TOKEN_COOKIE_NAME],
      ]),
      secretOrKey: configService.get('auth.refreshTokenSecret', {
        infer: true,
      }),
      passReqToCallback: true,
    });
  }

  public async validate(req: Request, payload: JwtRefreshPayloadType) {
    try {
      const session = await this.sessionService.getOne({
        where: {
          id: payload.sessionId,
          hash: payload.hash,
          user: { isActive: true },
        },
      });

      if (!session) {
        Helpers.clearCookies(req.res);
        throw new UnauthorizedException('Invalid session');
      }

      // Check if token is expired
      const checkTokenExpiration = session.expiresAt.getTime() < Date.now();
      if (checkTokenExpiration) {
        Helpers.clearCookies(req.res);
        throw new UnauthorizedException('Refresh token expired');
      }

      return session;
    } catch (error) {
      Logger.error(error);
      Helpers.clearCookies(req.res);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
