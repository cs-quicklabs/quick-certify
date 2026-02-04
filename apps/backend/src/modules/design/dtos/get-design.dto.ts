import { PaginationDto } from '@src/commons/base';
import { IsEnum, IsOptional } from 'class-validator';
import { Design } from '../enums';

export class GetDesignDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Design)
  type?: Design;
}
