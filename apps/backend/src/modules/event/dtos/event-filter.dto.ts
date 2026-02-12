import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@src/commons/base/dtos';

export class EventFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Comma-separated event type UUIDs to filter by' })
  @IsString()
  @IsOptional()
  typeIds?: string;

  @ApiPropertyOptional({ description: 'Comma-separated event level UUIDs to filter by' })
  @IsString()
  @IsOptional()
  levelIds?: string;

  @ApiPropertyOptional({ description: 'Comma-separated event format UUIDs to filter by' })
  @IsString()
  @IsOptional()
  formatIds?: string;
}
