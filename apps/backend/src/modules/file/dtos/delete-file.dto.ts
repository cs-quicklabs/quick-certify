import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

/**
 * DTO for deleting a file by URL
 */
export class DeleteFileDto {
  @ApiProperty({
    example: 'https://dev.quick-certify.sfo3.digitaloceanspaces.com/organizations/.../logo/...jpg',
    description: 'Full URL of the file to delete',
  })
  @IsUrl({}, { message: 'Please provide a valid file URL' })
  @IsNotEmpty({ message: 'File URL is required' })
  url: string;
}
