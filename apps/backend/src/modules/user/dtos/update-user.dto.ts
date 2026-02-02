import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Gender } from './create-user.dto';
import { AuthProvider } from '@src/commons/constants';

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

  @ApiPropertyOptional({ example: 1, description: 'Role ID (integer)' })
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @ApiPropertyOptional({ default: true, description: 'Whether email notifications are enabled' })
  @IsBoolean()
  @IsOptional()
  is_email_notifications_enabled?: boolean;

  @ApiPropertyOptional({
    enum: ['active', 'inactive', 'archived'],
    description: 'User status',
    example: 'active',
  })
  @IsEnum(['active', 'inactive', 'archived'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'archived';

  @ApiPropertyOptional({
    example: 'StrongP@ssw0rd!',
    description:
      'Password (min 8 chars, must include uppercase, lowercase, number, and special char). Internal use only.',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: 'google_123456789',
    description: 'Google ID for OAuth. Internal use only.',
  })
  @IsString()
  @IsOptional()
  google_id?: string;

  @ApiPropertyOptional({
    enum: AuthProvider,
    description: 'Authentication provider. Internal use only.',
  })
  @IsEnum(AuthProvider)
  @IsOptional()
  auth_provider?: AuthProvider;

  @ApiPropertyOptional({
    description: 'Last login timestamp. Internal use only.',
  })
  @IsOptional()
  last_login_at?: Date;
}
