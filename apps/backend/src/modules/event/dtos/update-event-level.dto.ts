import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateNamedEntityDto } from '@src/commons/base';

export class UpdateEventLevelDto extends UpdateNamedEntityDto {
  @ApiPropertyOptional({
    example: 'Beginner',
    description: 'Event level name',
    maxLength: 150,
  })
  override name?: string;
}
