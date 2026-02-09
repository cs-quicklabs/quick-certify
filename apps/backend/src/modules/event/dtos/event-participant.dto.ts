import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for creating a new participant for an event
 */
export class CreateEventParticipantDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Participant full name',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Participant email address',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email!: string;
}

/**
 * DTO for updating an existing participant
 */
export class UpdateEventParticipantDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Participant full name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name?: string;

  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Participant email address',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email?: string;
}

/**
 * DTO for bulk adding participants to an event
 */
export class BulkAddParticipantsDto {
  @ApiProperty({
    example: [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
    ],
    description: 'Array of participants to add to the event',
    type: [CreateEventParticipantDto],
  })
  @IsNotEmpty({ message: 'Participants array is required' })
  participants!: CreateEventParticipantDto[];
}

/**
 * DTO for response - participant data
 */
export class EventParticipantResponseDto {
  @ApiProperty({ example: 'abc123xyz789' })
  uuid!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}
