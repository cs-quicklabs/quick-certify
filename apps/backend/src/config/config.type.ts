import { AppConfig } from './app-config';
import { DatabaseConfig } from '../database/config/database-config.type';
import { AuthConfig } from './auth.config';
import { MailerConfigType } from './mailer.config';
import { SmsConfigType } from './sms.config';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  mailer: MailerConfigType;
  sms: SmsConfigType;
};
