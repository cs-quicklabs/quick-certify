import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Nz...',
    description: 'Google ID token from OAuth authentication',
  })
  @IsString()
  @IsNotEmpty({ message: 'Google ID token is required' })
  idToken = '';
}
