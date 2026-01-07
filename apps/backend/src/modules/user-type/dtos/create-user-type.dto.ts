import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateUserTypeDto {
  @ApiProperty({ example: 'Administrator', description: 'User type name' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Unique code for the user type (uppercase, no spaces)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: 'Code must be uppercase letters, numbers, and underscores only',
  })
  code: string;

  @ApiPropertyOptional({ description: 'Description of the user type' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Whether the user type is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
