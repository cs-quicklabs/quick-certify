import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateEventTypeDto {
  @ApiPropertyOptional({
    example: 'Workshop',
    description: 'Event type name',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Event type name must be a string' })
  @MaxLength(150, { message: 'Event type name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Event type name cannot be empty or only spaces',
  })
  name?: string;
}
