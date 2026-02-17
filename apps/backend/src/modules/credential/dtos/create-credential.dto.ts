import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CredentialStatusEnum } from '@src/commons/enums';

export class CreateCredentialDto {
  @ApiProperty({ example: 'John Doe', description: 'Recipient name', maxLength: 200 })
  @IsNotEmpty({ message: 'Recipient name is required' })
  @IsString()
  @MaxLength(200)
  recipientName!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Recipient email' })
  @IsNotEmpty({ message: 'Recipient email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  recipientEmail!: string;

  @ApiProperty({ example: 'abc123xyz', description: 'Event UUID' })
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsString()
  eventId!: string;

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

  @ApiPropertyOptional({ example: 'https://...', description: 'Unique certificate URL' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  certificateUrl?: string;

  @ApiPropertyOptional({
    enum: [CredentialStatusEnum.DRAFT, CredentialStatusEnum.ISSUED],
    default: CredentialStatusEnum.DRAFT,
  })
  @IsOptional()
  @IsEnum(CredentialStatusEnum, { message: 'Status must be DRAFT or ISSUED' })
  status?: CredentialStatusEnum.DRAFT | CredentialStatusEnum.ISSUED;
}
