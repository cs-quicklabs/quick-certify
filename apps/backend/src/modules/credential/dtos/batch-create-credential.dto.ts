import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BatchRecipientDto {
  @ApiProperty({ example: 'John Doe', description: 'Recipient name', maxLength: 200 })
  @IsNotEmpty({ message: 'Recipient name is required' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Recipient email' })
  @IsNotEmpty({ message: 'Recipient email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;
}

export class BatchCreateCredentialDto {
  @ApiProperty({ example: 'abc123xyz', description: 'Event UUID' })
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsString()
  eventId!: string;

  @ApiProperty({ description: 'Idempotency key to prevent duplicate batch submissions' })
  @IsNotEmpty({ message: 'Idempotency key is required' })
  @IsString()
  @MaxLength(64)
  idempotencyKey!: string;

  @ApiProperty({ type: [BatchRecipientDto], description: 'List of recipients' })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @ArrayMaxSize(500, { message: 'Maximum 500 recipients per batch' })
  @ValidateNested({ each: true })
  @Type(() => BatchRecipientDto)
  recipients!: BatchRecipientDto[];

  @ApiPropertyOptional({ example: '2025-06-12', description: 'Issued date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Issued date must be a valid ISO 8601 date string (e.g. YYYY-MM-DD)' },
  )
  issuedDate?: string;

  @ApiPropertyOptional({ example: '2026-06-12', description: 'Expiration date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Expiration date must be a valid ISO 8601 date string (e.g. YYYY-MM-DD)' },
  )
  expirationDate?: string;
}
