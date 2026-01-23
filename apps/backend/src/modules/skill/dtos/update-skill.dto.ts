import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateSkillDto {
  @ApiPropertyOptional({
    example: 'JavaScript',
    description: 'Skill name',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Skill name must be a string' })
  @MaxLength(150, { message: 'Skill name must not exceed 150 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Skill name cannot be empty or only spaces',
  })
  name?: string;
}
