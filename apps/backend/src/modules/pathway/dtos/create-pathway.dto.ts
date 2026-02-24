import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PathwayEventItemDto } from './pathway-event-item.dto';

export class CreatePathwayDto {
  @ApiProperty({
    example: 'Full Stack Developer',
    description: 'Pathway name',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Pathway name is required' })
  @IsString({ message: 'Pathway name must be a string' })
  @MaxLength(255, { message: 'Pathway name must not exceed 255 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Pathway name cannot be empty or only spaces',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'Master the fundamentals of full-stack web development...',
    description: 'Pathway description',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banners/pathway.png',
    description: 'Banner image URL',
  })
  @IsOptional()
  @IsString({ message: 'Banner URL must be a string' })
  @IsUrl({}, { message: 'Banner URL must be a valid URL' })
  @MaxLength(500, { message: 'Banner URL must not exceed 500 characters' })
  bannerUrl?: string;

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
    example: [
      { eventId: 'event-uuid-1', isFinal: false },
      { eventId: 'event-uuid-2', isFinal: true },
    ],
    description: 'Array of events with order (from array index) and isFinal flag',
    type: [PathwayEventItemDto],
  })
  @IsOptional()
  @IsArray({ message: 'Events must be an array' })
  @ValidateNested({ each: true })
  @Type(() => PathwayEventItemDto)
  events?: PathwayEventItemDto[];
}
