import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { SkillEntity } from '@src/entities/skill.entity';
import { AuthModule } from '../auth';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    SequelizeModule.forFeature([SkillEntity]),
    AuthModule, // For RolesGuard
    EventModule, // For EventSkillService
  ],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
