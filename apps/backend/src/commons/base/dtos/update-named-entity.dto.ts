import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * Base DTO for updating named entities (EventType, EventLevel, EventFormat, etc.)
 * Child classes can override the ApiPropertyOptional decorator for custom examples/descriptions
 */
export class UpdateNamedEntityDto {
  @ApiPropertyOptional({
    example: 'Updated Name',
    description: 'Entity name',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(150, { message: 'Name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Name cannot be empty or only spaces',
  })
  name?: string;
}
