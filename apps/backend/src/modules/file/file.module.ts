import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { StorageService } from '@src/commons/services';

/**
 * File Module
 *
 * Handles file operations (upload, delete) to cloud storage (DigitalOcean Spaces)
 */
@Module({
  controllers: [FileController],
  providers: [StorageService],
  exports: [StorageService],
})
export class FileModule {}

