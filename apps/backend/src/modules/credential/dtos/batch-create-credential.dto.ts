import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
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

  @ApiProperty({ type: [BatchRecipientDto], description: 'List of recipients' })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @ArrayMaxSize(100, { message: 'Maximum 100 recipients per batch' })
  @ValidateNested({ each: true })
  @Type(() => BatchRecipientDto)
  recipients!: BatchRecipientDto[];

  @ApiPropertyOptional({ example: '2025-06-12', description: 'Issued date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  issuedDate?: string;

  @ApiPropertyOptional({ example: '2026-06-12', description: 'Expiration date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional({ enum: ['draft', 'issued'], default: 'issued' })
  @IsOptional()
  @IsEnum(['draft', 'issued'])
  status?: 'draft' | 'issued';
}
