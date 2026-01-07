import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserTypeDto {
  @ApiPropertyOptional({ example: 'Administrator', description: 'User type name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the user type' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Whether the user type is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
