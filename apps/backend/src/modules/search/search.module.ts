import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventEntity, PathwayEntity, DesignEntity } from '@src/entities';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { UserModule } from '../user';

@Module({
  imports: [SequelizeModule.forFeature([EventEntity, PathwayEntity, DesignEntity]), UserModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
