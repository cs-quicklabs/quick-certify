import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PathwayParticipantStatusEnum } from '@src/commons/enums';

export class UpdateParticipantStatusDto {
  @ApiProperty({
    example: 'in_progress',
    description: 'Participant status',
    enum: PathwayParticipantStatusEnum,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(PathwayParticipantStatusEnum, {
    message: 'Status must be invited, in_progress, or completed',
  })
  status!: PathwayParticipantStatusEnum;
}
