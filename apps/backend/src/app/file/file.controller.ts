import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Query,
  Put,
  Logger,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { FileService } from './file.service';
import { FilePathEnum } from '@quick-certify/shared';

interface MulterS3File extends Express.Multer.File {
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
  contentDisposition: null;
  storageClass: string;
  serverSideEncryption: null;
  metadata: { fieldname: string };
  location: string;
  etag: string;
}

@ApiTags('File')
@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Post(':path/upload')
  @ApiOperation({ summary: 'Upload a file to a specific path' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'path',
    enum: FilePathEnum,
    description: 'The path where the file will be stored',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterS3File,
    @Param('path') path: FilePathEnum
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    return {
      url: file.location,
      key: file.key,
      path,
    };
  }

  @Put(':path/update')
  @ApiOperation({
    summary: 'Update a file in a specific path and delete the previous one',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'path',
    enum: FilePathEnum,
    description: 'The path where the file will be stored',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        previousUrl: {
          type: 'string',
          description: 'URL of the previous file to be deleted',
        },
      },
      required: ['file', 'previousUrl'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @UploadedFile() file: MulterS3File,
    @Query('previousUrl') previousUrl: string,
    @Param('path') path: FilePathEnum
  ) {
    try {
      this.logger.debug('Update file request received', {
        fileReceived: !!file,
        previousUrl,
        path,
      });

      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      if (!previousUrl) {
        throw new HttpException(
          'Previous URL is required',
          HttpStatus.BAD_REQUEST
        );
      }

      this.logger.debug('Calling file service updateFile method', {
        newFileLocation: file.location,
        previousUrl,
      });

      const result = await this.fileService.updateFile(file, previousUrl);

      this.logger.debug('File update completed successfully', result);

      return {
        ...result,
        path,
      };
    } catch (error) {
      this.logger.error('Error in updateFile endpoint:', {
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Error updating file',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':path')
  @ApiOperation({ summary: 'Delete files from a specific path' })
  @ApiParam({
    name: 'path',
    enum: FilePathEnum,
    description: 'The path where the files are stored',
  })
  async deleteFiles(
    @Query('urls') urls: string,
    @Param('path') path: FilePathEnum
  ) {
    try {
      const fileUrls = urls.split(',');
      await this.fileService.deleteFiles(fileUrls);
      return { message: 'Files deleted successfully', path };
    } catch (error) {
      this.logger.error('Error in deleteFiles:', error);
      throw error;
    }
  }
}
