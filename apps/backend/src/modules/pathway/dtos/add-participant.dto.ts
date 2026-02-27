import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddParticipantDto {
  @ApiProperty({ example: 'Divanshu Sharma', maxLength: 200 })
  @IsNotEmpty({ message: 'Participant name is required' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'divanshu@example.com' })
  @IsNotEmpty({ message: 'Participant email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;
}
