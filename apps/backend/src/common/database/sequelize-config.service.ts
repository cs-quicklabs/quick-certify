import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SequelizeOptionsFactory,
  SequelizeModuleOptions,
} from '@nestjs/sequelize';
import { AllConfigType } from '@/config/config.type';
import { Models } from '@/models';

@Injectable()
export class SequelizeConfigService implements SequelizeOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: this.configService.get('database.dialect', { infer: true }),
      host: this.configService.get('database.host', { infer: true }),
      port: this.configService.get('database.port', { infer: true }),
      username: this.configService.get('database.username', { infer: true }),
      password: this.configService.get('database.password', { infer: true }),
      database: this.configService.get('database.database', { infer: true }),
      synchronize: this.configService.get('database.synchronize', {
        infer: true,
      }),
      logging:
        this.configService.get('database.logging', { infer: true }) &&
        console.log,
      models: [...Models],
      pool: {
        max: this.configService.get('database.maxConnections', { infer: true }),
      },
      ssl: this.configService.get('database.sslEnabled', { infer: true }),
    };
  }
}
