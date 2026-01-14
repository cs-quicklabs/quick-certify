import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
/**
 * DTO for updating user profile
 *
 * Allows users to update their profile information
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsOptional()
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
