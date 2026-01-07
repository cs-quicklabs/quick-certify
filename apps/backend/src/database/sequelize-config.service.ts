import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions, SequelizeOptionsFactory } from '@nestjs/sequelize';
import { AllConfigType } from '@src/config/config.type';
import { entities } from '@src/entities';

@Injectable()
export class SequelizeConfigService implements SequelizeOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createSequelizeOptions(): SequelizeModuleOptions {
    const databaseConfig = this.configService.getOrThrow('database', {
      infer: true,
    });

    return {
      dialect: databaseConfig.dialect,
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      logging: databaseConfig.logging ?? false,
      synchronize: databaseConfig.synchronize ?? false,
      autoLoadModels: true,
      models: [...entities],
      pool: {
        max: 5,
        min: 0,
      },
      dialectOptions:
        databaseConfig.dialect === 'postgres' && !databaseConfig.host.includes('localhost')
          ? {
              ssl:
                process.env.DATABASE_SSL_ENABLED === 'true'
                  ? {
                      rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
                      ca: process.env.DATABASE_CA ?? undefined,
                      key: process.env.DATABASE_KEY ?? undefined,
                      cert: process.env.DATABASE_CERT ?? undefined,
                    }
                  : undefined,
            }
          : undefined,
    };
  }
}
