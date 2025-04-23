import { AppConfig } from './app-config';
import { DatabaseConfig } from '@/common/database/config/database-config.type';
import { AuthConfig } from '@/modules/user/config/auth-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
};
