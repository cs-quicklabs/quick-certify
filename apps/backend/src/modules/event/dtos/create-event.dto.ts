import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * DTO for creating a new event
 *
 * Required fields: name, designId, eventTypeId, eventLevelId, eventFormatId
 * Optional fields: description, learningLink, skillIds
 */
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
    description: 'Event type UUID (nanoid)',
  })
  @IsNotEmpty({ message: 'Event type ID is required' })
  @IsString({ message: 'Event type ID must be a string' })
  eventTypeId!: string;

  @ApiProperty({
    example: 'def456uvw012',
    description: 'Event level UUID (nanoid)',
  })
  @IsNotEmpty({ message: 'Event level ID is required' })
  @IsString({ message: 'Event level ID must be a string' })
  eventLevelId!: string;

  @ApiProperty({
    example: 'ghi789rst345',
    description: 'Event format UUID (nanoid)',
  })
  @IsNotEmpty({ message: 'Event format ID is required' })
  @IsString({ message: 'Event format ID must be a string' })
  eventFormatId!: string;

  @ApiProperty({
    example: 'design123',
    description: 'Design UUID (nanoid) to attach to this event - required',
  })
  @IsNotEmpty({ message: 'Design ID is required' })
  @IsString({ message: 'Design ID must be a string' })
  designId!: string;

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
    description: 'Array of skill UUIDs to associate with this event',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill ID must be a string' })
  skillIds?: string[];
}
