'use strict';

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });

module.exports = {
  development: {
    dialect: process.env.DATABASE_TYPE || 'postgres',
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    logging: process.env.DATABASE_LOG === 'true',
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    dialect: process.env.DATABASE_TYPE || 'postgres',
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME ? `${process.env.DATABASE_NAME}_test` : 'quick_certify_test',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    dialect: process.env.DATABASE_TYPE || 'postgres',
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    },
    dialectOptions: {
      ssl: process.env.DATABASE_SSL_ENABLED === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10) || 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
