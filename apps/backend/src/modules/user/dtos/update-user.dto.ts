import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Gender } from './create-user.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: Gender, description: 'Gender' })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsString()
  @IsOptional()
  profile_picture?: string;

  @ApiPropertyOptional({ example: 'xyz789', description: 'Role ID (nanoid)' })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ default: true, description: 'Whether email notifications are enabled' })
  @IsBoolean()
  @IsOptional()
  is_email_notifications_enabled?: boolean;

  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    description: 'User status',
    example: 'active',
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}
