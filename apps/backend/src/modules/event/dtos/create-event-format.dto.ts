import { ApiProperty } from '@nestjs/swagger';
import { CreateNamedEntityDto } from '@src/commons/base';

export class CreateEventFormatDto extends CreateNamedEntityDto {
  @ApiProperty({
    example: 'Online',
    description: 'Event format name',
    maxLength: 150,
  })
  override name!: string;
}
