import { ApiProperty } from '@nestjs/swagger';
import { CreateNamedEntityDto } from '@src/commons/base';

export class CreateEventTypeDto extends CreateNamedEntityDto {
  @ApiProperty({
    example: 'Workshop',
    description: 'Event type name',
    maxLength: 150,
  })
  override name!: string;
}
