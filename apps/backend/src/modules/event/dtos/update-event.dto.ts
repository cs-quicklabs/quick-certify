import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl, MaxLength, Matches } from 'class-validator';

/**
 * DTO for updating an existing event
 *
 * All fields are optional to support partial updates.
 * Use this for both updating existing events and completing
 * progressive event creation (Step 2).
 */
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
    description: 'Event type UUID (nanoid)',
  })
  @IsOptional()
  @IsString({ message: 'Event type ID must be a string' })
  eventTypeId?: string;

  @ApiPropertyOptional({
    example: 'def456uvw012',
    description: 'Event level UUID (nanoid)',
  })
  @IsOptional()
  @IsString({ message: 'Event level ID must be a string' })
  eventLevelId?: string;

  @ApiPropertyOptional({
    example: 'ghi789rst345',
    description: 'Event format UUID (nanoid)',
  })
  @IsOptional()
  @IsString({ message: 'Event format ID must be a string' })
  eventFormatId?: string;

  @ApiPropertyOptional({
    example: 'design123',
    description: 'Design UUID (nanoid) to attach to this event',
  })
  @IsOptional()
  @IsString({ message: 'Design ID must be a string' })
  designId?: string;

  @ApiPropertyOptional({
    example: 'A comprehensive workshop covering JavaScript basics...',
    description: 'Event description - supports rich text or plain text',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/events/js-workshop',
    description: 'External learning resources link',
  })
  @IsOptional()
  @IsString({ message: 'Learning link must be a string' })
  @IsUrl({}, { message: 'Learning link must be a valid URL' })
  @MaxLength(500, { message: 'Learning link must not exceed 500 characters' })
  learningLink?: string;

  @ApiPropertyOptional({
    example: ['skill-uuid-1', 'skill-uuid-2'],
    description: 'Array of skill UUIDs to associate with this event. Replaces existing skills.',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill ID must be a string' })
  skillIds?: string[];
}
