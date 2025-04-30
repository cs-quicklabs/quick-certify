import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SessionModel } from '@/models';
import { SessionService } from './session.service';

@Module({
  imports: [SequelizeModule.forFeature([SessionModel])],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
