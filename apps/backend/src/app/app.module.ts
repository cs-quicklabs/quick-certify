import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { User } from './user/models/user.model';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import fileConfig from './file/config/file.config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
      load: [fileConfig],
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Maddy@1234',
      database: 'quick-certify',
      autoLoadModels: true,
      synchronize: true,
      logging: console.log,
    }),
    UserModule,
    EmailModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
