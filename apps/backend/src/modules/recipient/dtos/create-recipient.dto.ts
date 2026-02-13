import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRecipientDto {
  @ApiProperty({ example: 'John Doe', maxLength: 200 })
  @IsNotEmpty({ message: 'Recipient name is required' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty({ message: 'Recipient email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;
}
