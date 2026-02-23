import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class PathwayEventItemDto {
  @ApiProperty({ example: 'event-uuid-1', description: 'Event UUID' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiPropertyOptional({ example: false, description: 'Whether this is the final credential' })
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;
}
