import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from '@/modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from '@/common/database/sequelize-config.service';
import databaseConfig from '@/common/database/config/database.config';
import appConfig from '@/config/app.config';
import { OrganizationModule } from '../organization/organization.module';
import { EmailModule } from '@/modules/email/email.module';
import { FileModule } from '@/modules/file/file.module';
import fileConfig from '../file/config/file.config';
import authConfig from '../user/config/auth.config';
import { HealthCheckModule } from '../health-check/health-check.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, appConfig, fileConfig, authConfig],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),
    HealthCheckModule,
    UserModule,
    OrganizationModule,
    EmailModule,
    FileModule,
    RoleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
