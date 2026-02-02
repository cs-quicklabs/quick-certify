import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Design } from '@src/modules/design/enums';
import { Transform } from 'class-transformer';

export class CreateDesignDto {
  @ApiProperty({
    example: 'Course Completion Certificate/ Over Achiever Badge',
    description: 'Name of the Design',
  })
  @IsString()
  @IsNotEmpty({ message: 'Design name is required' })
  @MaxLength(125, { message: 'Event name must not exceed 255 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Design name cannot be empty or only spaces',
  })
  name = '';

  @ApiProperty({ description: 'Design Url' })
  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Design Url invalid' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Design Url cannot be empty or only spaces',
  })
  designUrl?: string = '';

  @ApiProperty({ enum: Design })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEnum(Design, { message: 'Design Type must be a valid Design' })
  designType?: Design = Design.Certificate;
}
