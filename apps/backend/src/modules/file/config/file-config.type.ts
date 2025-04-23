export type FileConfig = {
  endPoint: string; // Removed optional marker
  accessKeyId: string;
  secretAccessKey: string;
  awsS3Region: string;
  awsDefaultS3Bucket: string;
  maxFileSize: number;
};
