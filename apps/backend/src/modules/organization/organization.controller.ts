import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';

@ApiTags('Organization')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}
}
