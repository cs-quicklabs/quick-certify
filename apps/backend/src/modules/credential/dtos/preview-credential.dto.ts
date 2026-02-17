import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class PreviewCredentialDto {
  @ApiProperty({ description: 'Event UUID' })
  @IsNotEmpty()
  @IsString()
  eventId!: string;

  @ApiProperty({ description: 'Recipient name for preview', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  recipientName!: string;

  @ApiProperty({ description: 'Recipient email for preview', example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  recipientEmail!: string;

  @ApiPropertyOptional({ description: 'Issued date (YYYY-MM-DD)', example: '2026-02-16' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Issued date must be a valid ISO 8601 date string (e.g. YYYY-MM-DD)' },
  )
  issuedDate?: string;

  @ApiPropertyOptional({ description: 'Expiration date (YYYY-MM-DD)', example: '2027-02-16' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Expiration date must be a valid ISO 8601 date string (e.g. YYYY-MM-DD)' },
  )
  expirationDate?: string;
}
