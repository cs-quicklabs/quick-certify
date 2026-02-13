import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RecipientEntity } from '@src/entities';
import { AuthModule } from '../auth';
import { OrganizationModule } from '../organization';
import { RecipientController } from './recipient.controller';
import { RecipientService } from './recipient.service';

@Module({
  imports: [SequelizeModule.forFeature([RecipientEntity]), AuthModule, OrganizationModule],
  controllers: [RecipientController],
  providers: [RecipientService],
  exports: [RecipientService],
})
export class RecipientModule {}
