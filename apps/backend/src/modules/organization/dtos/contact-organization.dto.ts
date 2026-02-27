import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ContactOrganizationDto {
  @ApiProperty({
    example: 'jimhalpert@example.com',
    description: 'Sender email address',
  })
  @IsEmail()
  @IsNotEmpty()
  declare email: string;

  @ApiProperty({
    example: 'Jim Halpert',
    description: 'Sender full name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  declare name: string;

  @ApiProperty({
    example: 'Hello, I would like to know more about your services.',
    description: 'Message content from the sender',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  declare message: string;
}
