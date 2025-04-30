import { IsNotEmpty, MinLength, IsUrl } from 'class-validator';
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

  @ApiProperty({
    example: 'https://example.com',
    description: 'Website URL of the organization',
  })
  @IsNotEmpty()
  @IsUrl()
  websiteUrl: string;
}
