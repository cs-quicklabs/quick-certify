import { registerAs } from '@nestjs/config';
import { FileConfig } from './file-config.type';

export default registerAs(
  'file',
  (): FileConfig => {
    const endpoint = process.env.AWS_Endpoint;
    // Ensure endpoint starts with https:// for DigitalOcean Spaces
    const formattedEndpoint = endpoint?.startsWith('http') 
      ? endpoint 
      : `https://${endpoint}`;

    return {
      endPoint: formattedEndpoint,
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      awsS3Region: process.env.AWS_S3_REGION || 'blr1',
      awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    };
  }
);
