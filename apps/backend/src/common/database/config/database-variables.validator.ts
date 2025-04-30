import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class DatabaseVariablesValidator {
  @IsString()
  DATABASE_TYPE: string;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  @ValidateIf((o) => o.DATABASE_PORT !== undefined)
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USERNAME: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_LOG?: boolean;

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE?: boolean;

  @IsNumber()
  @IsOptional()
  DATABASE_MAX_CONNECTIONS?: number;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL_ENABLED?: boolean;

  @IsBoolean()
  @IsOptional()
  DATABASE_REJECT_UNAUTHORIZED?: boolean;

  @IsString()
  @IsOptional()
  DATABASE_CA?: string;

  @IsString()
  @IsOptional()
  DATABASE_KEY?: string;

  @IsString()
  @IsOptional()
  DATABASE_CERT?: string;
}
