import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateParticipantStatusDto {
  @ApiProperty({
    example: 'in_progress',
    description: 'Participant status',
    enum: ['invited', 'in_progress', 'completed'],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsString()
  @IsIn(['invited', 'in_progress', 'completed'], {
    message: 'Status must be invited, in_progress, or completed',
  })
  status!: string;
}
