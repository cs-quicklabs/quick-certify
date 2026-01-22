import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class CreateEventTypeDto {
  @ApiProperty({
    example: 'Workshop',
    description: 'Event type name',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'Event type name is required' })
  @IsString({ message: 'Event type name must be a string' })
  @MaxLength(150, { message: 'Event type name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Event type name cannot be empty or only spaces',
  })
  name!: string;
}
