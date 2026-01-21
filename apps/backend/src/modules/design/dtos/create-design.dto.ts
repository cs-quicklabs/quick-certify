import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Design } from "@src/modules/design/enums"

export class CreateDesignDto {
  @ApiProperty({ example: 'Course Completion Certificate/ Over Achiever Badge', description: 'Name of the Design' })
  @IsString()
  @IsNotEmpty({ message: 'Design name is required' })
  name = '';

  @ApiProperty({ description: 'Design Url' })
  @IsString()
  @IsOptional()
  designUrl?: string = ''

  @ApiProperty({ enum: Design })
  @IsString()
  designType?: Design = Design.Certificate;

}
