import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Design } from '@src/modules/design/enums';
import { Transform } from 'class-transformer';
import { capitalizeFirst } from '@src/commons/utils';

export class UpdateDesignDto {
  @ApiProperty({
    example: 'Course Completion Certificate/ Over Achiever Badge',
    description: 'Name of the Design',
  })
  @IsString()
  @IsNotEmpty({ message: 'Design name is required' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return capitalizeFirst(trimmed);
  })
  @MinLength(1, { message: 'Design name cannot be empty' })
  @MaxLength(100, { message: 'Design name must not exceed 100 characters' })
  name?: string = '';

  @ApiProperty({ description: 'Design Url' })
  @IsString()
  designUrl?: string = '';

  @ApiProperty({ enum: Design })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEnum(Design, { message: 'Design Type must be a valid Design' })
  designType?: Design;
}
