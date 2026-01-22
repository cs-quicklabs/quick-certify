import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({
    example: 'JavaScript Fundamentals Workshop',
    description: 'Event name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Event name must be a string' })
  @MaxLength(255, { message: 'Event name must not exceed 255 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Event name cannot be empty or only spaces',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'abc123xyz789',
    description: 'Event type ID (nanoid)',
  })
  @IsOptional()
  @IsString({ message: 'Event type ID must be a string' })
  eventTypeId?: string;

  @ApiPropertyOptional({
    example: 'def456uvw012',
    description: 'Event level ID (nanoid)',
  })
  @IsOptional()
  @IsString({ message: 'Event level ID must be a string' })
  eventLevelId?: string;

  @ApiPropertyOptional({
    example: 'ghi789rst345',
    description: 'Event format ID (nanoid)',
  })
  @IsOptional()
  @IsString({ message: 'Event format ID must be a string' })
  eventFormatId?: string;
}
