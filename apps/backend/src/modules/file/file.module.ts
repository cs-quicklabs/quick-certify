import { Module, Logger } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { Request } from 'express';
import { FilePathEnum } from '@quick-certify/shared';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('MulterS3Config');
        const fileConfig = configService.get('file');

        logger.debug(
          `Initializing S3 client with endpoint: ${fileConfig.endPoint}`
        );

        try {
          const s3 = new S3Client({
            forcePathStyle: true,
            endpoint: fileConfig.endPoint,
            region: fileConfig.awsS3Region,
            credentials: {
              accessKeyId: fileConfig.accessKeyId,
              secretAccessKey: fileConfig.secretAccessKey,
            },
          });

          return {
            storage: multerS3({
              s3,
              bucket: fileConfig.awsDefaultS3Bucket,
              acl: 'public-read',
              contentType: multerS3.AUTO_CONTENT_TYPE,
              metadata: (req, file, cb) => {
                logger.debug(`Processing file metadata: ${file.originalname}`);
                cb(null, { fieldName: file.fieldname });
              },
              key: (req: Request, file, cb) => {
                const uniqueSuffix =
                  Date.now() + '-' + Math.round(Math.random() * 1e9);
                const path = req.params.path as FilePathEnum;
                const key = `${path.toLowerCase()}/${uniqueSuffix}-${
                  file.originalname
                }`;
                logger.debug(`Generated file key: ${key}`);
                cb(null, key);
              },
            }),
            limits: {
              fileSize: fileConfig.maxFileSize,
            },
          };
        } catch (error) {
          logger.error('Error configuring multer-s3:', error);
          throw error;
        }
      },
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
