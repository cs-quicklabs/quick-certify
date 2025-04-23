import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { EnvironmentEnum } from '@/common/enums';

export class AppVariablesValidator {
  @IsEnum(EnvironmentEnum)
  NODE_ENV: EnvironmentEnum;

  @IsString()
  APP_NAME: string;

  @IsNumber()
  @ValidateIf((o) => o.APP_PORT !== undefined)
  APP_PORT: number;

  @IsString()
  @IsOptional()
  SMTP_EMAIL?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsNumber()
  @ValidateIf((o) => o.SMTP_PORT !== undefined)
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;
}
