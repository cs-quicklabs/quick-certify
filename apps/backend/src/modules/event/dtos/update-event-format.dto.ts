import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateEventFormatDto {
  @ApiPropertyOptional({
    example: 'Online',
    description: 'Event format name',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Event format name must be a string' })
  @MaxLength(150, { message: 'Event format name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Event format name cannot be empty or only spaces',
  })
  name?: string;
}

