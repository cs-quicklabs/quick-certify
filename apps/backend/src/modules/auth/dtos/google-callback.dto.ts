import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for Google OAuth callback
 * Contains authorization code and state from Google redirect
 */
export class GoogleCallbackDto {
  @ApiProperty({
    example: '4/0AY0e-g...',
    description: 'Authorization code from Google',
  })
  @IsString()
  @IsNotEmpty({ message: 'Authorization code is required' })
  code: string = '';

  @ApiProperty({
    example: 'abc123xyz',
    description: 'State parameter for CSRF protection',
  })
  @IsString()
  @IsNotEmpty({ message: 'State parameter is required' })
  state: string = '';

  @ApiPropertyOptional({
    example: 'openid email profile',
    description: 'Scope granted by Google',
  })
  @IsString()
  @IsOptional()
  scope?: string;
}

