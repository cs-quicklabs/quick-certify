import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import Helpers from '@/utils/helper';
import { SessionService } from '@/modules/session/session.service';
import { AllConfigType } from '@/config/config.type';
import { UserModel } from '@/models';

export const JWT_ACCESS_TOKEN_STRATEGY_NAME = 'jwt-access-token';
export const JWT_ACCESS_TOKEN_COOKIE_NAME = 'access_token';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_TOKEN_STRATEGY_NAME
) {
  private readonly logger = new Logger(JwtAccessTokenStrategy.name);

  constructor(
    private readonly sessionService: SessionService,
    configService: ConfigService<AllConfigType>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => request?.cookies?.[JWT_ACCESS_TOKEN_COOKIE_NAME],
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.accessTokenSecret', { infer: true }),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { id: string; email: string; sessionId: number }
  ) {
    const session = await this.sessionService.getOne({
      where: {
        id: payload.sessionId,
        userId: payload.id,
      },
      include: [UserModel],
    });

    if (!session || !session.user.isActive) {
      throw new UnauthorizedException();
    }

    // Check if token is expired
    if (session.expiresAt.getTime() < Date.now()) {
      Helpers.clearCookies(req.res);
      throw new UnauthorizedException('Refresh token expired');
    }

    return session.user;
  }
}
