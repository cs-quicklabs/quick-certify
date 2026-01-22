import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateEventLevelDto {
  @ApiPropertyOptional({
    example: 'Beginner',
    description: 'Event level name',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Event level name must be a string' })
  @MaxLength(150, { message: 'Event level name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Event level name cannot be empty or only spaces',
  })
  name?: string;
}
