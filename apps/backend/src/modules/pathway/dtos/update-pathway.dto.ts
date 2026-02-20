import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdatePathwayDto {
  @ApiPropertyOptional({
    example: 'Full Stack Developer',
    description: 'Pathway name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Pathway name must be a string' })
  @MaxLength(255, { message: 'Pathway name must not exceed 255 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Pathway name cannot be empty or only spaces',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'Master the fundamentals of full-stack web development...',
    description: 'Pathway description',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Description must be a string' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://example.com/banners/pathway.png',
    description: 'Banner image URL',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Banner URL must be a string' })
  @IsUrl({}, { message: 'Banner URL must be a valid URL' })
  @MaxLength(500, { message: 'Banner URL must not exceed 500 characters' })
  bannerUrl?: string | null;

  @ApiPropertyOptional({
    example: '6 months',
    description: 'Pathway duration',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'Duration must be a string' })
  @MaxLength(100, { message: 'Duration must not exceed 100 characters' })
  duration?: string | null;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Pathway status (draft, active, archived)',
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @Matches(/^(draft|active|archived)$/, {
    message: 'Status must be draft, active, or archived',
  })
  status?: string;

  @ApiPropertyOptional({
    example: ['event-uuid-1', 'event-uuid-2'],
    description: 'Array of event UUIDs. Replaces existing events.',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Event IDs must be an array' })
  @IsString({ each: true, message: 'Each event ID must be a string' })
  eventIds?: string[];
}
