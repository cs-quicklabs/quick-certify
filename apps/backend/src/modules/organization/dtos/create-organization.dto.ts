import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corporation', description: 'Organization name' })
  @IsString()
  @IsNotEmpty({ message: 'Organization name should be at least 4 characters long' })
  @MaxLength(150, { message: 'Organization name must not exceed 150 characters' })
  declare name: string;

  @ApiPropertyOptional({
    example: 'acme-corporation',
    description: 'URL-friendly slug (auto-generated if not provided)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'Slug must not exceed 150 characters' })
  slug?: string;

  @ApiPropertyOptional({ example: true, description: 'Organization active status', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Issuer verification status',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  issuer_verified?: boolean;
}
