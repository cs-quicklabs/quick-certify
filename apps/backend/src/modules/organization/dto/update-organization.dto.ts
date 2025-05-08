import {
  IsFacebookUrl,
  IsLinkedInUrl,
  IsTwitterUrl,
  IsWebsiteUrl,
} from '@/common/validators/social-url.validators';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Name of the organization',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    example: 'Acme Corp is a leading provider of innovative solutions.',
    description: 'Detailed description of the organization',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'support@acmecorp.com',
    description: 'Support email address for the organization',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiProperty({
    example: 'Innovation at its best',
    description: 'Organization slogan or tagline',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  slogan?: string;

  @ApiProperty({
    example: 123456,
    description: 'LinkedIn Company ID',
    required: false,
  })
  @IsOptional()
  @IsInt()
  linkedInCompanyId?: number;

  @IsOptional()
  @IsLinkedInUrl()
  linkedInUrl?: string;

  @IsOptional()
  @IsFacebookUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsTwitterUrl()
  twitterUrl?: string;

  @IsOptional()
  @IsWebsiteUrl()
  websiteUrl?: string;

  @ApiProperty({
    example: 'https://my-bucket.s3.amazonaws.com/logos/acme.png',
    description: 'S3 URL for issuer/organization logo image',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  issuerLogo?: string;

  @ApiProperty({
    example: 'https://my-bucket.s3.amazonaws.com/favicons/acme.ico',
    description: 'S3 URL for organization favicon',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  favIcon?: string;

  @ApiProperty({
    example: 'https://my-bucket.s3.amazonaws.com/banners/acme.jpg',
    description: 'S3 URL for organization banner image',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  bannerImage?: string;

  @ApiProperty({
    example: false,
    description:
      'Indicates whether the issuer portal is enabled for this organization',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isEnabledIssuerPortal?: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the organization has been verified',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
