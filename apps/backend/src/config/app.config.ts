import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
import { AppConfig } from './app-config';
import { validateConfig } from '@src/commons/utils';
import { EnvironmentEnum } from '@src/commons/constants';

class EnvironmentVariablesValidator {
  @IsEnum(EnvironmentEnum)
  @IsOptional()
  ENV?: EnvironmentEnum;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT?: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN?: string;

  @IsString()
  @IsOptional()
  API_PREFIX?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;
}

/**
 * Parse CORS origins from environment variable
 * Supports comma-separated URLs: "http://localhost:3000,http://localhost:3001"
 */
function parseCorsOrigins(corsOrigins?: string, frontendDomain?: string): string[] {
  const origins: string[] = [];

  // Add frontend domain as default
  if (frontendDomain) {
    origins.push(frontendDomain);
  }

  // Parse additional CORS origins from environment variable
  if (corsOrigins) {
    const additionalOrigins = corsOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
    origins.push(...additionalOrigins);
  }

  // Remove duplicates
  return [...new Set(origins)];
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  const frontendDomain = process.env.FRONTEND_DOMAIN ?? 'http://localhost:3000';

  return {
    env: (process.env.ENV as EnvironmentEnum) || EnvironmentEnum.Dev,
    name: process.env.APP_NAME || 'Quick Certify',
    frontendDomain,
    backendDomain: process.env.BACKEND_DOMAIN ?? 'http://localhost',
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3001,
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS, frontendDomain),
  };
});
