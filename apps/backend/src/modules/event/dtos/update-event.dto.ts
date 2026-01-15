import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, Matches } from 'class-validator';

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
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Event type ID (UUID)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Event type ID must be a valid UUID' })
  eventTypeId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Event level ID (UUID)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Event level ID must be a valid UUID' })
  eventLevelId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'Event format ID (UUID)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Event format ID must be a valid UUID' })
  eventFormatId?: string;
}

