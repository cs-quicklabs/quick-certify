import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class CreateSkillDto {
    @ApiProperty({
        example: 'JavaScript',
        description: 'Skill name',
        maxLength: 150,
    })
    @IsNotEmpty({ message: 'Skill name is required' })
    @IsString({ message: 'Skill name must be a string' })
    @MaxLength(150, { message: 'Skill name must not exceed 150 characters' })
    @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
        message: 'Skill name cannot be empty or only spaces',
    })
    name!: string;
}

