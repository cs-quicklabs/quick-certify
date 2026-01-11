import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { StorageService } from '@src/commons/services';
import type { UploadCategory } from '@src/commons/services';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Roles } from '@src/modules/auth/decorators';
import { Role } from '@src/modules/role/enums';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';
import { DeleteFileDto } from './dtos';

type MulterFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

/**
 * File Controller
 *
 * Handles file operations (upload, delete) for various purposes (logo, favicon, banner, avatar)
 * SRP: Single responsibility for file operation endpoints
 */
@ApiTags('Files')
@ApiBearerAuth()
@Controller({ path: 'files', version: '1' })
export class FileController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiQuery({
    name: 'category',
    enum: ['logo', 'favicon', 'banner', 'avatar'],
    description: 'Upload category',
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or category' })
  async uploadFile(
    @CurrentUser() user: CurrentUserType,
    @UploadedFile() file: MulterFile,
    @Query('category') category: UploadCategory,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!category) {
      throw new BadRequestException('Category is required');
    }

    const validCategories: UploadCategory[] = ['logo', 'favicon', 'banner', 'avatar'];
    if (!validCategories.includes(category)) {
      throw new BadRequestException(
        `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      );
    }

    const result = await this.storageService.uploadFile(
      file.buffer,
      category,
      user.organizationId,
      file.mimetype,
      file.originalname,
    );

    return new SuccessResponse('File uploaded successfully', result);
  }

  @Delete()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a file by URL' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file URL' })
  async deleteFile(@Body() dto: DeleteFileDto) {
    await this.storageService.deleteFileByUrl(dto.url);
    return new SuccessResponse('File deleted successfully', { deleted: true });
  }

  @Post('check-status')
  @ApiOperation({ summary: 'Check if storage is configured' })
  @ApiResponse({ status: 200, description: 'Storage status' })
  checkStatus() {
    return new SuccessResponse('Storage status', {
      configured: this.storageService.isStorageConfigured(),
    });
  }
}

