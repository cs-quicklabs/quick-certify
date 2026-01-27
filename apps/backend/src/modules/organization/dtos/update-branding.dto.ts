import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

/**
 * DTO for updating organization branding
 *
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/branding
 * Allows empty strings to remove images
 */
export class UpdateBrandingDto {
  @ApiPropertyOptional({
    example: 'https://cdn.example.com/logo.png',
    description:
      'Company logo URL (PNG, JPG, JPEG, max 1MB, min 400x400px). Use empty string to remove logo.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Logo URL must not exceed 500 characters' })
  @ValidateIf((o) => o.logo_url !== '' && o.logo_url !== undefined)
  @IsUrl({}, { message: 'Please provide a valid URL for the logo' })
  logo_url?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/favicon.ico',
    description: 'Favicon URL (SVG, JPG, PNG, max 1MB). Use empty string to remove favicon.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Favicon URL must not exceed 500 characters' })
  @ValidateIf((o) => o.favicon_url !== '' && o.favicon_url !== undefined)
  @IsUrl({}, { message: 'Please provide a valid URL for the favicon' })
  favicon_url?: string;
}
