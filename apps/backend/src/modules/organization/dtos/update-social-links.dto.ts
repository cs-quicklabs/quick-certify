import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { IsLinkedInUrl, IsFacebookUrl, IsTwitterUrl, IsWebsiteUrl } from '@src/commons/validators';

/**
 * DTO for updating organization social links
 *
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/social-links
 */
export class UpdateSocialLinksDto {
  @ApiPropertyOptional({
    example: 'https://linkedin.com/company/acme-corp',
    description: 'LinkedIn company profile URL',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'LinkedIn URL must not exceed 500 characters' })
  @IsLinkedInUrl()
  linkedin_url?: string;

  @ApiPropertyOptional({
    example: 'https://facebook.com/acmecorp',
    description: 'Facebook page URL',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Facebook URL must not exceed 500 characters' })
  @IsFacebookUrl()
  facebook_url?: string;

  @ApiPropertyOptional({
    example: 'https://twitter.com/acmecorp',
    description: 'Twitter/X profile URL',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Twitter URL must not exceed 500 characters' })
  @IsTwitterUrl()
  twitter_url?: string;

  @ApiPropertyOptional({
    example: 'https://www.acme.com',
    description: 'Company website URL',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Website URL must not exceed 500 characters' })
  @IsWebsiteUrl()
  website?: string;
}
