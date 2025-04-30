import { Response } from 'express';
import crypto from 'crypto';
import { EnvironmentEnum } from '@/common/enums';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import {
  JWT_ACCESS_TOKEN_COOKIE_NAME,
  JWT_REFRESH_TOKEN_COOKIE_NAME,
} from '@/modules/auth/strategies';

export default class Helpers {
  static generateRandomHash() {
    return crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
  }

  static clearCookies(res: Response) {
    res.clearCookie(JWT_ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(JWT_REFRESH_TOKEN_COOKIE_NAME);
  }

  static setCookies(
    res: Response,
    name: string,
    value: string,
    expires?: number
  ) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== EnvironmentEnum.Development,
      sameSite: 'lax',
      maxAge: expires,
      path: '/',
    });
  }
}
