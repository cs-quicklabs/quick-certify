import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string = '';

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string = '';

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string = '';

  @ApiPropertyOptional({
    example: 'StrongP@ssw0rd!',
    description:
      'Password (min 8 chars, must include uppercase, lowercase, number, and special char). Optional for invitations.',
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must include uppercase, lowercase, number, and special character',
  })
  password?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string = '';

  @ApiPropertyOptional({ enum: Gender, description: 'Gender' })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender = Gender.Male;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsString()
  @IsOptional()
  profilePicture?: string = '';

  @ApiProperty({ example: 'abc123', description: 'Organization ID (nanoid)' })
  @IsString()
  @IsNotEmpty({ message: 'Organization ID is required' })
  organizationId: string = '';

  @ApiProperty({ example: 'xyz789', description: 'Role ID (nanoid)' })
  @IsString()
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string = '';
}
