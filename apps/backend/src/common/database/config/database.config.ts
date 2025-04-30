import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './database-config.type';
import validateConfig from '@/utils/validate-config';
import { DatabaseVariablesValidator } from './database-variables.validator';

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, DatabaseVariablesValidator);

  return {
    dialect: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT
      ? parseInt(process.env.DATABASE_PORT, 10)
      : 5432,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    logging: process.env.DATABASE_LOG === 'true',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    maxConnections: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 100,
    sslEnabled: process.env.DATABASE_SSL_ENABLED === 'true',
  };
});
