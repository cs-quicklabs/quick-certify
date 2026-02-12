import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name must be at most 100 characters long' })
  declare firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must be at most 100 characters long' })
  declare lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  declare email: string;

  @ApiProperty({ example: 'Acme Corporation', description: 'Company / Issuer Name' })
  @IsString()
  @IsNotEmpty({ message: 'Company / Issuer Name is required' })
  @MaxLength(150, { message: 'Company name must be at most 150 characters long' })
  declare companyName: string;

  @ApiProperty({ example: 'https://acme.com', description: 'Website URL' })
  @IsUrl({}, { message: 'Please provide a valid website URL' })
  @IsNotEmpty({ message: 'Website URL is required' })
  declare websiteUrl: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description:
      'Password (min 8 chars, must include uppercase, lowercase, number, and special char)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must include uppercase, lowercase, number, and special character',
  })
  declare password: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'Confirm Password (must match password)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  declare confirmPassword: string;
}
