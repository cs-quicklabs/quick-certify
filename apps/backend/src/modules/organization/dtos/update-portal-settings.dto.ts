import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

/**
 * DTO for updating issuer portal settings
 *
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/issuer-portal
 * Allows empty strings to remove banner
 */
export class UpdatePortalSettingsDto {
  @ApiPropertyOptional({
    example: 'https://cdn.example.com/banner.png',
    description: 'Banner image URL (PNG, JPG, JPEG, 1920x300px). Use empty string to remove banner.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Banner URL must not exceed 500 characters' })
  @ValidateIf((o) => o.banner_url !== '' && o.banner_url !== undefined)
  @IsUrl({}, { message: 'Please provide a valid URL for the banner' })
  banner_url?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Enable or disable the public issuer portal',
  })
  @IsBoolean()
  @IsOptional()
  portal_enabled?: boolean;
}

