import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'JavaScript Fundamentals Workshop',
    description: 'Event name',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Event name is required' })
  @IsString({ message: 'Event name must be a string' })
  @MaxLength(255, { message: 'Event name must not exceed 255 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Event name cannot be empty or only spaces',
  })
  name!: string;

  @ApiProperty({
    example: 'abc123xyz789',
    description: 'Event type ID (nanoid)',
  })
  @IsNotEmpty({ message: 'Event type ID is required' })
  @IsString({ message: 'Event type ID must be a string' })
  eventTypeId!: string;

  @ApiProperty({
    example: 'def456uvw012',
    description: 'Event level ID (nanoid)',
  })
  @IsNotEmpty({ message: 'Event level ID is required' })
  @IsString({ message: 'Event level ID must be a string' })
  eventLevelId!: string;

  @ApiProperty({
    example: 'ghi789rst345',
    description: 'Event format ID (nanoid)',
  })
  @IsNotEmpty({ message: 'Event format ID is required' })
  @IsString({ message: 'Event format ID must be a string' })
  eventFormatId!: string;
}
