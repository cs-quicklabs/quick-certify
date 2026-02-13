import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
/**
 * DTO for updating user profile
 *
 * SECURITY NOTE: Email field is intentionally NOT included here.
 * Users cannot change their own email address.
 * Only Admin/Super Admin can change a user's email via /users/:uuid endpoint.
 *
 * firstName is required - frontend should always send the current firstName
 */
export class UpdateProfileDto {
  @ApiProperty({ example: 'John', description: 'First name (required)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
  avatarUrl?: string | null;
}

/**
 * DTO for updating email preferences
 *
 * Allows users to update their email notification settings
 */
export class UpdateEmailPreferencesDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Enable or disable all email notifications',
  })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;
}
