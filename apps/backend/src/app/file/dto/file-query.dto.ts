import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FilePathEnum } from '@quick-certify/shared';

export class FileQueryDto {
  @ApiProperty({
    enum: FilePathEnum,
    description: 'Path where the file will be stored',
    required: false,
  })
  @IsEnum(FilePathEnum)
  @IsOptional()
  path?: FilePathEnum;
}
