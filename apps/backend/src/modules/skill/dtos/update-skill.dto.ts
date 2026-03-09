import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSkillDto {
  @ApiPropertyOptional({
    example: 'JavaScript',
    description: 'Skill name',
    maxLength: 150,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (value === undefined) return value;
    const trimmed = value?.trim() ?? '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  })
  @IsString({ message: 'Skill name must be a string' })
  @MaxLength(150, { message: 'Skill name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Skill name cannot be empty or only spaces',
  })
  name?: string;
}
