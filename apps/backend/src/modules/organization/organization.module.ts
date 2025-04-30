import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationUserService } from './organization-user.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationUserService],
  exports: [OrganizationService, OrganizationUserService],
})
export class OrganizationModule {}
