import { registerAs } from '@nestjs/config';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DatabaseConfig } from './database-config.type';
import { validateConfig } from '@src/commons/utils';

enum DatabaseType {
  Postgres = 'postgres',
  Mysql = 'mysql',
  Sqlite = 'sqlite',
  Mariadb = 'mariadb',
  Mssql = 'mssql',
}
class EnvironmentVariablesValidator {
  @IsOptional()
  @IsEnum(DatabaseType, { message: 'DATABASE_TYPE must be a valid database type' })
  DATABASE_TYPE!: DatabaseType;

  @IsString()
  DATABASE_HOST!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(65535)
  DATABASE_PORT!: number;

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_NAME is required' })
  DATABASE_NAME!: string;

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_USERNAME is required' })
  DATABASE_USERNAME!: string;

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_PASSWORD is required' })
  DATABASE_PASSWORD!: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_LOG!: boolean;

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE!: boolean;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    dialect: (process.env.DATABASE_TYPE ?? DatabaseType.Postgres) as DatabaseConfig['dialect'],
    host: (process.env.DATABASE_HOST ?? 'localhost') as string,
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
    username: process.env.DATABASE_USERNAME as string,
    password: process.env.DATABASE_PASSWORD as string,
    database: process.env.DATABASE_NAME as string,
    logging: process.env.DATABASE_LOG === 'true',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  };
});
