import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventEntity, PathwayEntity, DesignEntity, UserEntity, RoleEntity } from '@src/entities';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [SequelizeModule.forFeature([EventEntity, PathwayEntity, DesignEntity, UserEntity, RoleEntity])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
