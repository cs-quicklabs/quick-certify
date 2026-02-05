import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateNamedEntityDto } from '@src/commons/base';

export class UpdateEventTypeDto extends UpdateNamedEntityDto {
  @ApiPropertyOptional({
    example: 'Workshop',
    description: 'Event type name',
    maxLength: 150,
  })
  override name?: string;
}
