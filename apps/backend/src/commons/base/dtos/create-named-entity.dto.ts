import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

/**
 * Base DTO for creating named entities (EventType, EventLevel, EventFormat, etc.)
 * Child classes can override the ApiProperty decorator for custom examples/descriptions
 */
export class CreateNamedEntityDto {
  @ApiProperty({
    example: 'Example Name',
    description: 'Entity name',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(150, { message: 'Name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Name cannot be empty or only spaces',
  })
  name!: string;
}
