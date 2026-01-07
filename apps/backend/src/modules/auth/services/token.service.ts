import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AllConfigType } from '@src/config/config.type';
import { ITokenService, TokenPayloadInput, JwtPayload, JwtTokens } from '../interfaces';

/**
 * Token Service Implementation
 *
 * SRP: Handles all JWT token operations:
 * - Generating access/refresh tokens
 * - Verifying tokens
 * - Decoding tokens
 */
@Injectable()
export class TokenService implements ITokenService {
  private readonly jwtSecret: string;
  private readonly accessTokenExpiresIn: number;
  private readonly refreshTokenExpiresIn: number;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.jwtSecret = this.configService.getOrThrow('auth.jwtSecret', { infer: true });
    this.accessTokenExpiresIn = this.configService.getOrThrow('auth.jwtAccessTokenExpiresIn', {
      infer: true,
    });
    this.refreshTokenExpiresIn = this.configService.getOrThrow('auth.jwtRefreshTokenExpiresIn', {
      infer: true,
    });
  }

  generateTokens(input: TokenPayloadInput): JwtTokens {
    const basePayload = {
      sub: input.userId,
      uuid: input.userUuid,
      email: input.email,
      organizationId: input.organizationId,
      userTypeCode: input.userTypeCode,
      sessionHash: input.sessionHash,
    };

    const accessTokenPayload: JwtPayload = {
      ...basePayload,
      type: 'access',
    };

    const refreshTokenPayload: JwtPayload = {
      ...basePayload,
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessTokenPayload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiresIn,
    });

    const refreshToken = jwt.sign(refreshTokenPayload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + this.accessTokenExpiresIn * 1000),
      refreshTokenExpiresAt: new Date(Date.now() + this.refreshTokenExpiresIn * 1000),
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);

      if (typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid token format');
      }

      return decoded as unknown as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw error;
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token);
      if (typeof decoded === 'string' || decoded === null) {
        return null;
      }
      return decoded as JwtPayload;
    } catch {
      return null;
    }
  }

  get accessTokenTTL(): number {
    return this.accessTokenExpiresIn;
  }

  get refreshTokenTTL(): number {
    return this.refreshTokenExpiresIn;
  }
}
