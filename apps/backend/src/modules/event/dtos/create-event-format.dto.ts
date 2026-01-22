import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class CreateEventFormatDto {
  @ApiProperty({
    example: 'Online',
    description: 'Event format name',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'Event format name is required' })
  @IsString({ message: 'Event format name must be a string' })
  @MaxLength(150, { message: 'Event format name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Event format name cannot be empty or only spaces',
  })
  name!: string;
}
