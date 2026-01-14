import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { SkillEntity } from '@src/entities/skill.entity';
import { AuthModule } from '../auth';

@Module({
    imports: [
        SequelizeModule.forFeature([SkillEntity]),
        AuthModule, // For RolesGuard
    ],
    controllers: [SkillController],
    providers: [SkillService],
    exports: [SkillService],
})
export class SkillModule { }

