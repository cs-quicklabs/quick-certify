import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * DTO for completing Google signup with organization details
 * Used after Google OAuth when user needs to provide additional info
 *
 * Two modes:
 * 1. With idToken - For ID Token flow (frontend sends token directly)
 * 2. With tempToken - For Authorization Code flow (backend issued temp token)
 */
export class GoogleSignupCompleteDto {
  @ApiPropertyOptional({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Nz...',
    description: 'Google ID token from OAuth authentication (for ID Token flow)',
  })
  @IsString()
  @IsOptional()
  idToken?: string;

  @ApiPropertyOptional({
    example: 'temp_abc123xyz',
    description: 'Temporary token from callback (for Authorization Code flow)',
  })
  @IsString()
  @IsOptional()
  tempToken?: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name (optional, will use Google name if not provided)' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name (optional)' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'Acme Corporation', description: 'Company / Issuer Name' })
  @IsString()
  @IsNotEmpty({ message: 'Company / Issuer Name is required' })
  companyName: string = '';

  @ApiProperty({ example: 'https://acme.com', description: 'Website URL' })
  @IsUrl({}, { message: 'Please provide a valid website URL' })
  @IsNotEmpty({ message: 'Website URL is required' })
  websiteUrl: string = '';
}
