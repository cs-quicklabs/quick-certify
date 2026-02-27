import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditLogEntity } from './audit-log.entity';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [SequelizeModule.forFeature([AuditLogEntity])],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
