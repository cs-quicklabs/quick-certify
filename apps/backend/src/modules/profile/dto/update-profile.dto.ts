import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsString()
  @IsOptional()
  profile_picture?: string;

  @ApiPropertyOptional({ default: true, description: 'Whether notifications are enabled' })
  @IsBoolean()
  @IsOptional()
  is_notifications_enabled?: boolean;
}
