import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from '@/modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from '@/common/database/sequelize-config.service';
import databaseConfig from '@/common/database/config/database.config';
import appConfig from '@/config/app.config';
import { OrganizationModule } from '../organization/organization.module';
import { EmailModule } from '@/modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, appConfig],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),
    UserModule,
    OrganizationModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
