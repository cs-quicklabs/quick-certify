import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CredentialStatusEnum } from '@src/commons/enums';

export class UpdateCredentialDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Recipient name', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientName?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Recipient email' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  recipientEmail?: string;

  @ApiPropertyOptional({ example: 'abc123xyz', description: 'Event UUID' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ example: '2025-06-12', description: 'Issued date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  issuedDate?: string;

  @ApiPropertyOptional({ example: '2026-06-12', description: 'Expiration date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional({ example: 'https://...', description: 'Unique certificate URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  certificateUrl?: string;

  @ApiPropertyOptional({ enum: [CredentialStatusEnum.DRAFT, CredentialStatusEnum.ISSUED] })
  @IsOptional()
  @IsEnum(CredentialStatusEnum, { message: 'Status must be DRAFT or ISSUED' })
  status?: CredentialStatusEnum.DRAFT | CredentialStatusEnum.ISSUED;
}
