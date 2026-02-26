import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DesignController } from './design.controller';
import { DesignService } from './design.services';
import { DesignEntity } from '@src/entities';
import { UserModule } from '../user';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DesignEntity]),
    UserModule,
    forwardRef(() => EventModule),
  ],
  controllers: [DesignController],
  providers: [DesignService],
  exports: [DesignService],
})
export class DesignModule {}
