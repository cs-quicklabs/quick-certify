import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { DurationType } from '@src/commons/constants/constants';

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
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Event type ID must be a string' })
  eventTypeId?: string | null;

  @ApiPropertyOptional({
    example: 'def456uvw012',
    description: 'Event level UUID (nanoid)',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Event level ID must be a string' })
  eventLevelId?: string | null;

  @ApiPropertyOptional({
    example: 'ghi789rst345',
    description: 'Event format UUID (nanoid)',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Event format ID must be a string' })
  eventFormatId?: string | null;

  @ApiPropertyOptional({
    example: 'design123',
    description: 'Design UUID (nanoid) to attach to this event',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Design ID must be a string' })
  designId?: string | null;

  @ApiPropertyOptional({
    example: 'A comprehensive workshop covering JavaScript basics...',
    description: 'Event description - supports rich text or plain text',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Description must be a string' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://example.com/events/js-workshop',
    description: 'External learning resources link',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Learning link must be a string' })
  @IsUrl({}, { message: 'Learning link must be a valid URL' })
  @MaxLength(500, { message: 'Learning link must not exceed 500 characters' })
  learningLink?: string | null;

  @ApiPropertyOptional({
    example: 'week',
    description: 'Duration type (day, week, month)',
    enum: DurationType,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsEnum(DurationType, { message: 'Duration type must be day, week, or month' })
  durationType?: DurationType | null;

  @ApiPropertyOptional({
    example: 4,
    description: 'Duration value',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt({ message: 'Duration value must be an integer' })
  @Min(0, { message: 'Duration value must be 0 or greater' })
  durationValue?: number | null;

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
