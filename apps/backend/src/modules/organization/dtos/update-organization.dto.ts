import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Corporation', description: 'Organization name' })
  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'Organization name must not exceed 150 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'acme-corporation', description: 'URL-friendly slug' })
  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'Slug must not exceed 150 characters' })
  slug?: string;

  @ApiPropertyOptional({ example: true, description: 'Organization active status' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Issuer verification status' })
  @IsBoolean()
  @IsOptional()
  issuer_verified?: boolean;
}
