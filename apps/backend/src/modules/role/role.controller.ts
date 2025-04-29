import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
}
