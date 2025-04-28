import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'newPassword123',
    description: 'New password for the user account (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    example: 'abc123.1234567890',
    description: 'Reset token received in the email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
