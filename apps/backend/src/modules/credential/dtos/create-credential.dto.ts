import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
  @IsString()
  issuedDate?: string;

  @ApiPropertyOptional({ example: '2026-06-12', description: 'Expiration date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional({ example: 'https://...', description: 'Unique certificate URL' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  certificateUrl?: string;

  @ApiPropertyOptional({ enum: ['draft', 'issued'], default: 'draft' })
  @IsOptional()
  @IsEnum(['draft', 'issued'])
  status?: 'draft' | 'issued';
}
