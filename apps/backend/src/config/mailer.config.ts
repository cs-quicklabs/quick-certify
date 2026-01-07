import { registerAs } from '@nestjs/config';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { validateConfig } from '@src/commons/utils';

export interface MailerConfigType {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  defaultFrom: string;
  previewEmail: boolean;
}

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  MAIL_HOST: string;

  @IsNumber()
  @IsOptional()
  MAIL_PORT: number;

  @IsBoolean()
  @IsOptional()
  MAIL_SECURE: boolean;

  @IsString()
  @IsOptional()
  MAIL_USER: string;

  @IsString()
  @IsOptional()
  MAIL_PASS: string;

  @IsString()
  @IsOptional()
  MAIL_FROM: string;

  @IsBoolean()
  @IsOptional()
  MAIL_PREVIEW: boolean;
}

export default registerAs<MailerConfigType>('mailer', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  const isDev = process.env.ENV === 'dev';

  return {
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 587,
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    defaultFrom: process.env.MAIL_FROM || 'noreply@crownstack.com',
    previewEmail: process.env.MAIL_PREVIEW === 'true' || isDev,
  };
});
