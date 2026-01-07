import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { validateConfig } from '@src/commons/utils';

export interface AuthConfig {
  jwtSecret: string;
  jwtAccessTokenExpiresIn: number;
  jwtRefreshTokenExpiresIn: number;
  bcryptSaltRounds: number;
  passwordResetExpiresIn: number;
}

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty({ message: 'JWT_SECRET is required' })
  JWT_SECRET: string;

  @IsNumber()
  @IsOptional()
  JWT_ACCESS_TOKEN_EXPIRES_IN: number;

  @IsNumber()
  @IsOptional()
  JWT_REFRESH_TOKEN_EXPIRES_IN: number;

  @IsNumber()
  @IsOptional()
  BCRYPT_SALT_ROUNDS: number;

  @IsNumber()
  @IsOptional()
  PASSWORD_RESET_EXPIRES_IN: number;
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
    // Password reset expires in 1 hour (in seconds)
    passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN
      ? parseInt(process.env.PASSWORD_RESET_EXPIRES_IN, 10)
      : 3600,
  };
});
