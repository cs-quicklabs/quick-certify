import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the user account (minimum 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}