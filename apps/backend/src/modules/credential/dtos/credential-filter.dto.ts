import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@src/commons/base/dtos';

export class CredentialFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by event UUID' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Filter by event UUID' })
  @IsOptional()
  @IsString()
  recipientId?: string;
}
