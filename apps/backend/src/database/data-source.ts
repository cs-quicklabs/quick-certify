import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env file if it exists (optional)
// In production, environment variables are typically set directly in the environment
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  console.log('ℹ️ Loading environment variables from .env file');
  dotenv.config({ path: envPath });
}

/**
 * Database configuration for Sequelize CLI migrations
 *
 * This file is used by sequelize-cli for running migrations
 * It reads from environment variables for flexibility
 */
const databaseConfig = {
  development: {
    dialect: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeders',
    logging: process.env.DATABASE_LOG === 'true' ? console.log : false,
  },
  test: {
    dialect: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeders',
    logging: false,
  },
  production: {
    dialect: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeders',
    logging: false,
    dialectOptions:
      process.env.DATABASE_SSL_ENABLED === 'true'
        ? {
            ssl: {
              rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
              ca: process.env.DATABASE_CA,
              key: process.env.DATABASE_KEY,
              cert: process.env.DATABASE_CERT,
            },
          }
        : undefined,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
};

// Export for CommonJS (sequelize-cli compatibility)
module.exports = databaseConfig;
export default databaseConfig;
