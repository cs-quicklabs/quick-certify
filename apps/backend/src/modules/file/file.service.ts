import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

interface S3File extends Express.Multer.File {
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

@Injectable()
export class FileService {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(FileService.name);
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const fileConfig = this.configService.get('file');
    this.bucket = fileConfig.awsDefaultS3Bucket;

    if (
      !fileConfig.endPoint ||
      !fileConfig.accessKeyId ||
      !fileConfig.secretAccessKey
    ) {
      throw new Error('Missing required S3 configuration');
    }

    this.logger.log('Initializing S3 client');
    this.s3Client = new S3Client({
      forcePathStyle: true,
      endpoint: fileConfig.endPoint,
      region: fileConfig.awsS3Region,
      credentials: {
        accessKeyId: fileConfig.accessKeyId,
        secretAccessKey: fileConfig.secretAccessKey,
      },
    });
  }

  private extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // For DigitalOcean Spaces, the URL format is: https://<region>.digitaloceanspaces.com/<bucket>/<key>
      const parts = urlObj.pathname.split('/');
      // Remove empty string at the start (from leading slash) and the bucket name
      parts.shift(); // Remove empty string
      parts.shift(); // Remove bucket name
      const key = parts.join('/');

      this.logger.debug(`URL: ${url}`);
      this.logger.debug(`Extracted key: ${key}`);

      if (!key) {
        throw new Error('Could not extract valid key from URL');
      }

      return key;
    } catch (error) {
      this.logger.error(`Error extracting key from URL: ${url}`, error);
      throw new HttpException(
        `Invalid file URL format: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async deleteFiles(urls: string[]): Promise<void> {
    try {
      const deletePromises = urls.map(async (url) => {
        const key = this.extractKeyFromUrl(url);
        this.logger.debug(
          `Attempting to delete file with key: ${key} from bucket: ${this.bucket}`
        );

        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });

        try {
          await this.s3Client.send(command);
          this.logger.debug(`Successfully deleted file: ${key}`);
        } catch (error) {
          this.logger.error(`Failed to delete file ${key}:`, error);
          throw new HttpException(
            `Failed to delete file: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      this.logger.error(`Error in deleteFiles:`, error);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            `Failed to delete files: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
    }
  }

  async updateFile(
    file: S3File,
    previousUrl: string
  ): Promise<{ url: string; key: string }> {
    try {
      this.logger.debug(`Starting file update process`, {
        previousUrl,
        newFile: {
          key: file.key,
          location: file.location,
        },
      });

      // Delete the previous file before returning the new file information
      if (previousUrl) {
        await this.deleteFiles([previousUrl]);
      }

      if (!file.location || !file.key) {
        throw new HttpException(
          'New file upload failed - missing location or key',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      this.logger.debug(`File update successful`, {
        newLocation: file.location,
        newKey: file.key,
      });

      return {
        url: file.location,
        key: file.key,
      };
    } catch (error) {
      this.logger.error(`Error in updateFile:`, error);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            `Failed to update file: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
    }
  }
}
