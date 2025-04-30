import { IsEmail, IsNotEmpty, MinLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({
    example: 'Acme Corp',
    description: 'Organization name of the user',
  })
  @IsNotEmpty()
  @MinLength(2)
  organizationName: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'Website URL of the organization',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  @IsUrl()
  organizationWebsite: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the user account (minimum 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
