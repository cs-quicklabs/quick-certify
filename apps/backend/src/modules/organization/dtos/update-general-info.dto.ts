import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating organization general information
 *
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/general-information
 */
export class UpdateGeneralInfoDto {
  @ApiProperty({ example: 'Acme Corporation', description: 'Issuer or Organisation Name' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/^[A-Za-z0-9][A-Za-z0-9 '&.-]*$/, {
    message: 'Organization name should contain only alphanumeric values',
  })
  @MinLength(4, {
    message: 'Organization name should be at least 4 characters long',
  })
  @MaxLength(150, { message: 'Organization name must not exceed 150 characters' })
  name!: string;

  @ApiPropertyOptional({
    example: 'We specialize in professional certifications...',
    description: 'Issuer description shown on credential pages',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @ApiPropertyOptional({
    example: 'support@acme.com',
    description: 'Support email for recipients to contact',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  support_email?: string;

  @ApiPropertyOptional({
    example: 'Empowering Excellence',
    description: 'Company slogan',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Slogan must not exceed 255 characters' })
  slogan?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'LinkedIn Company ID for credential attribution',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]*$/, { message: 'LinkedIn Company ID should contain only numeric characters' })
  @MaxLength(10, { message: 'LinkedIn Company ID must not exceed 10 characters' })
  linkedin_company_id?: string;
}
