import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corporation', description: 'Organization name' })
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  name: string;

  @ApiPropertyOptional({ description: 'Organization logo URL' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country', description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@acme.com', description: 'Email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://acme.com', description: 'Website URL' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Organization description' })
  @IsString()
  @IsOptional()
  description?: string;
}
