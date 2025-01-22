import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { User } from './user/models/user.model';  // Add this import
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
    dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'quick-certify',
      autoLoadModels: true,
      synchronize: true,
      logging: console.log,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}