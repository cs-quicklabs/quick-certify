import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  declare currentPassword: string;

  @ApiProperty({
    example: 'NewStrongP@ssw0rd!',
    description:
      'New password (min 8 chars, must include uppercase, lowercase, number, and special char)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must include uppercase, lowercase, number, and special character',
  })
  declare newPassword: string;

  @ApiProperty({
    description: 'Whether to revoke all active sessions after password change',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'revokeAllSessions must be a boolean' })
  revokeAllSessions?: boolean;
}
