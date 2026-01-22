import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../enums';

export class CreateRoleDto {
  @ApiProperty({
    example: Role.SUPER_ADMIN,
    description: 'Role name',
    enum: Role,
    enumName: 'Role',
  })
  @IsEnum(Role, { message: 'Role must be a valid role value' })
  @IsNotEmpty({ message: 'Role name is required' })
  role!: Role;
}
