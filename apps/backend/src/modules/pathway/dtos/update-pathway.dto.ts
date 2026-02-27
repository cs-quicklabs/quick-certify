import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PathwayStatusEnum } from '@src/commons/enums';
import { PathwayEventItemDto } from './pathway-event-item.dto';

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
    example: 'active',
    description: 'Pathway status',
    enum: PathwayStatusEnum,
  })
  @IsOptional()
  @IsEnum(PathwayStatusEnum, {
    message: 'Status must be draft, active, or archived',
  })
  status?: PathwayStatusEnum;

  @ApiPropertyOptional({
    example: [
      { eventId: 'event-uuid-1', isFinal: false },
      { eventId: 'event-uuid-2', isFinal: true },
    ],
    description: 'Array of events with order and isFinal flag. Replaces existing events.',
    type: [PathwayEventItemDto],
  })
  @IsOptional()
  @IsArray({ message: 'Events must be an array' })
  @ValidateNested({ each: true })
  @Type(() => PathwayEventItemDto)
  events?: PathwayEventItemDto[];
}
