import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
import { AppConfig } from './app-config';
import { validateConfig } from '@src/commons/utils';
import { EnvironmentEnum } from '@src/commons/constants';

class EnvironmentVariablesValidator {
  @IsEnum(EnvironmentEnum)
  @IsOptional()
  ENV: EnvironmentEnum;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsUrl({ require_tld: false })
  FRONTEND_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    env: process.env.ENV || EnvironmentEnum.Production,
    name: process.env.APP_NAME || 'NestJS Boilerplate',
    frontendDomain: process.env.FRONTEND_DOMAIN ?? 'http://localhost:3000',
    backendDomain: process.env.BACKEND_DOMAIN ?? 'http://localhost',
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3001,
    apiPrefix: process.env.API_PREFIX ?? 'api',
  };
});
