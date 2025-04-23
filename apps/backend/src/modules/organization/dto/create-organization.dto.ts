import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Name of the organization',
  })
  @IsNotEmpty()
  @MinLength(2)
  @IsNotEmpty()
  name: string;
}
