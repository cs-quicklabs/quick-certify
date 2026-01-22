import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUrl } from 'class-validator';

/**
 * Action type for Google OAuth
 */
export enum GoogleAuthAction {
  LOGIN = 'login',
  SIGNUP = 'signup',
}

/**
 * DTO for initiating Google OAuth flow
 * Used to get the authorization URL for redirect
 */
export class GoogleAuthInitDto {
  @ApiProperty({
    enum: GoogleAuthAction,
    example: GoogleAuthAction.LOGIN,
    description: 'Whether this is a login or signup action',
  })
  @IsEnum(GoogleAuthAction, { message: 'Action must be either "login" or "signup"' })
  action: GoogleAuthAction = GoogleAuthAction.LOGIN;

  @ApiPropertyOptional({
    example: 'https://app.example.com/dashboard',
    description: 'URL to redirect to after successful authentication',
  })
  @IsUrl({ require_tld: false }, { message: 'Please provide a valid redirect URL' })
  @IsOptional()
  redirectUrl?: string;
}
