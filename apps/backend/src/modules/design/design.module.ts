import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DesignController } from './design.controller';
import { DesignService } from './design.services';
import { DesignEntity } from '@src/entities';
import { UserModule } from '../user';

@Module({
  imports: [SequelizeModule.forFeature([DesignEntity]), UserModule],
  controllers: [DesignController],
  providers: [DesignService],
})
export class DesignModule { }

