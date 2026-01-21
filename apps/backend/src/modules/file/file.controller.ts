import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
  Body,
  BadRequestException,
  ForbiddenException,
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
 * Categories that require admin privileges
 */
const ADMIN_ONLY_CATEGORIES: UploadCategory[] = ['logo', 'favicon', 'banner', 'design'];

/**
 * File Controller
 *
 * Handles file operations (upload, delete) for various purposes (logo, favicon, banner, avatar)
 * - avatar: Any authenticated user can upload
 * - logo, favicon, banner: Admin/Super Admin only
 * SRP: Single responsibility for file operation endpoints
 */
@ApiTags('Files')
@ApiBearerAuth()
@Controller({ path: 'files', version: '1' })
export class FileController {
  constructor(private readonly storageService: StorageService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file (avatar: all users, others: admin only)' })
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
  @ApiResponse({ status: 403, description: 'Access denied for non-avatar categories' })
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

    // Check authorization: admin-only categories require admin/super_admin role
    if (ADMIN_ONLY_CATEGORIES.includes(category)) {
      const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
      if (!isAdmin) {
        throw new ForbiddenException(
          `Access denied. Only Admin/Super Admin can upload ${category} files.`,
        );
      }
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
  @ApiOperation({ summary: 'Delete a file by URL (avatar: all users, others: admin only)' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file URL' })
  @ApiResponse({ status: 403, description: 'Access denied for non-avatar files' })
  async deleteFile(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: DeleteFileDto,
  ) {
    // Check if the file is an avatar (URL contains /avatar/)
    const isAvatarFile = dto.url.includes('/avatar/');

    // Non-avatar files require admin privileges
    if (!isAvatarFile) {
      const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
      if (!isAdmin) {
        throw new ForbiddenException(
          'Access denied. Only Admin/Super Admin can delete non-avatar files.',
        );
      }
    }

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

