import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '../enums';

export class UpdateRoleDto {
  @ApiPropertyOptional({ 
    example: Role.SUPER_ADMIN, 
    description: 'Role name',
    enum: Role,
    enumName: 'Role'
  })
  @IsEnum(Role, { message: 'Role must be a valid role value' })
  @IsOptional()
  role?: Role;
}

