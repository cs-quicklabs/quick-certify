import { registerAs } from '@nestjs/config';
import validateConfig from '@/utils/validate-config';
import { AuthConfig } from './auth-config.type';
import { AuthVariablesValidator } from './auth-variables.validator';

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, AuthVariablesValidator);

  return {
    saltOrRounds: process.env.SALT_OR_ROUNDS || 10,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRY,
    refreshTokenRememberMeExpires: process.env.REFRESH_REMEMBER_ME_EXPIRY,
  };
});
