import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { validateConfig } from '@src/commons/utils';

export interface AuthConfig {
  jwtSecret: string;
  jwtAccessTokenExpiresIn: number;
  jwtRefreshTokenExpiresIn: number;
  bcryptSaltRounds: number;
  passwordResetExpiresIn: number;
  invitationExpiresIn: number;
  googleClientId?: string;
  googleClientSecret?: string;
  googleCallbackUrl?: string;
}

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty({ message: 'JWT_SECRET is required' })
  JWT_SECRET: string = '';

  @IsNumber()
  @IsOptional()
  JWT_ACCESS_TOKEN_EXPIRES_IN?: number;

  @IsNumber()
  @IsOptional()
  JWT_REFRESH_TOKEN_EXPIRES_IN?: number;

  @IsNumber()
  @IsOptional()
  BCRYPT_SALT_ROUNDS?: number;

  @IsNumber()
  @IsOptional()
  PASSWORD_RESET_EXPIRES_IN?: number;

  @IsNumber()
  @IsOptional()
  INVITATION_EXPIRES_IN?: number;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsUrl({ require_tld: false }, { message: 'GOOGLE_CALLBACK_URL must be a valid URL' })
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    jwtSecret: process.env.JWT_SECRET as string,
    // Access token expires in 15 minutes (in seconds)
    jwtAccessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN
      ? parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, 10)
      : 900,
    // Refresh token expires in 7 days (in seconds)
    jwtRefreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
      ? parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, 10)
      : 604800,
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS
      ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
      : 12,
    // Password reset expires in 10 minutes (in seconds)
    passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN
      ? parseInt(process.env.PASSWORD_RESET_EXPIRES_IN, 10)
      : 600,
    // Invitation expires in 7 days (in seconds)
    invitationExpiresIn: process.env.INVITATION_EXPIRES_IN
      ? parseInt(process.env.INVITATION_EXPIRES_IN, 10)
      : 604800,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  };
});
