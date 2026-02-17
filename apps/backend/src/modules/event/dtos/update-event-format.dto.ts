import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateNamedEntityDto } from '@src/commons/base';

export class UpdateEventFormatDto extends UpdateNamedEntityDto {
  @ApiPropertyOptional({
    example: 'Online',
    description: 'Event format name',
    maxLength: 150,
  })
  override name?: string;
}
