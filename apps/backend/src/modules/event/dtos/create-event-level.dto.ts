import { ApiProperty } from '@nestjs/swagger';
import { CreateNamedEntityDto } from '@src/commons/base';

export class CreateEventLevelDto extends CreateNamedEntityDto {
  @ApiProperty({
    example: 'Beginner',
    description: 'Event level name',
    maxLength: 150,
  })
  override name!: string;
}
