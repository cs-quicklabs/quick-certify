import { registerAs } from '@nestjs/config';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { validateConfig } from '@src/commons/utils';

export interface SmsConfigType {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  previewMode: boolean;
}

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  TWILIO_ACCOUNT_SID: string;

  @IsString()
  @IsOptional()
  TWILIO_AUTH_TOKEN: string;

  @IsString()
  @IsOptional()
  TWILIO_FROM_NUMBER: string;

  @IsBoolean()
  @IsOptional()
  TWILIO_PREVIEW_MODE: boolean;
}

export default registerAs<SmsConfigType>('sms', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  const isDev = process.env.ENV === 'dev';

  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_FROM_NUMBER || '',
    previewMode: process.env.TWILIO_PREVIEW_MODE === 'true' || isDev,
  };
});
