import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Design } from "@src/modules/design/enums"
import { Transform } from "class-transformer";
import { capitalizeFirst } from "@src/commons/utils";

export class UpdateDesignDto {
  @ApiProperty({ example: 'Course Completion Certificate/ Over Achiever Badge', description: 'Name of the Design' })
  @IsString()
  @IsNotEmpty({ message: 'Design name is required' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return capitalizeFirst(trimmed);
  })
  @MinLength(1, { message: 'Design name cannot be empty' })
  @MaxLength(100, { message: 'Desing name must not exceed 100 characters' })
  name = '';

  @ApiProperty({ description: 'Design Url' })
  @IsString()
  designUrl?: string = ''

  @ApiProperty({ enum: Design })
  @IsString()
  designType?: Design;

}
