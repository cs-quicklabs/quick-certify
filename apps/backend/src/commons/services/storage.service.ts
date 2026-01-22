import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { AllConfigType } from '@src/config/config.type';
import { generateNanoid } from '../utils';

/**
 * Allowed file types for different upload categories
 */
export const ALLOWED_FILE_TYPES = {
  logo: ['image/png', 'image/jpeg', 'image/jpg'],
  favicon: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon'],
  banner: ['image/png', 'image/jpeg', 'image/jpg'],
  avatar: ['image/png', 'image/jpeg', 'image/jpg'],
  design: ['image/png', 'image/jpeg', 'image/jpg']
} as const;

/**
 * Maximum file sizes in bytes
 */
export const MAX_FILE_SIZES = {
  logo: 10 * 1024 * 1024, // 10MB
  favicon: 10 * 1024 * 1024, // 10MB
  banner: 10 * 1024 * 1024, // 10MB
  avatar: 10 * 1024 * 1024, // 10MB
  design: 1 * 1024 * 1024 // 1MB
} as const;

export type UploadCategory = keyof typeof ALLOWED_FILE_TYPES;

/**
 * Upload result interface
 */
export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  contentType: string;
  size: number;
}

/**
 * Storage Service
 *
 * Handles file uploads to DigitalOcean Spaces (S3-compatible)
 * SRP: Single responsibility for file storage operations
 */
@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cdnEndpoint: string;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const accessKey = this.configService.get('storage.accessKey', { infer: true });
    const secretKey = this.configService.get('storage.secretKey', { infer: true });
    const endpoint = this.configService.get('storage.endpoint', { infer: true });
    const bucketConfig = this.configService.get('storage.bucket', { infer: true }) || '';
    const cdnEndpointConfig = this.configService.get('storage.cdnEndpoint', { infer: true }) || '';

    // Extract bucket name from URL if full URL is provided
    this.bucket = this.extractBucketName(bucketConfig);

    // Clean and validate CDN endpoint
    this.cdnEndpoint = this.cleanCdnEndpoint(cdnEndpointConfig);

    this.isConfigured = !!(accessKey && secretKey && this.bucket);

    if (this.isConfigured) {
      this.s3Client = new S3Client({
        endpoint,
        region: this.configService.get('storage.region', { infer: true }),
        credentials: {
          accessKeyId: accessKey!,
          secretAccessKey: secretKey!,
        },
        forcePathStyle: false, // Required for DigitalOcean Spaces
      });
    } else {
      // Create a dummy client to avoid null checks
      this.s3Client = {} as S3Client;
    }
  }

  /**
   * Check if storage is properly configured
   */
  isStorageConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Upload a file to storage
   *
   * @param file - File buffer or stream
   * @param category - Upload category (logo, favicon, banner, avatar)
   * @param organizationId - Organization ID for path organization
   * @param originalFilename - Original filename for extension extraction
   * @returns Upload result with URL and metadata
   */
  async uploadFile(
    file: Buffer,
    category: UploadCategory,
    organizationId: string,
    contentType: string,
    originalFilename?: string,
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new BadRequestException('Storage is not configured');
    }

    // Validate file type
    const allowedTypes = ALLOWED_FILE_TYPES[category] as readonly string[];
    if (!allowedTypes.includes(contentType)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types for ${category}: ${allowedTypes.join(', ')}`,
      );
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[category];
    if (file.length > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size for ${category}: ${maxSize / (1024 * 1024)}MB`,
      );
    }

    // Generate unique filename
    const extension = this.getExtensionFromContentType(contentType, originalFilename);
    const filename = `${generateNanoid()}${extension}`;
    const key = `organizations/${organizationId}/${category}/${filename}`;

    // Upload to S3/Spaces
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read',
        CacheControl: 'max-age=31536000', // 1 year cache
      }),
    );

    // Construct CDN URL
    // Remove trailing slash from cdnEndpoint if present
    const baseUrl = this.cdnEndpoint.replace(/\/+$/, '');
    // Ensure key doesn't start with slash
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    const url = `${baseUrl}/${cleanKey}`;

    return {
      url,
      key,
      bucket: this.bucket,
      contentType,
      size: file.length,
    };
  }

  /**
   * Delete a file from storage
   *
   * @param key - File key/path in storage
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured) {
      throw new BadRequestException('Storage is not configured');
    }

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch {
      // Silently fail if file doesn't exist
    }
  }

  /**
   * Delete a file by its URL
   *
   * @param url - Full URL of the file
   */
  async deleteFileByUrl(url: string): Promise<void> {
    if (!url || !this.isConfigured) return;

    const key = this.extractKeyFromUrl(url);
    if (key) {
      await this.deleteFile(key);
    }
  }

  /**
   * Check if a file exists
   *
   * @param key - File key/path in storage
   */
  async fileExists(key: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract file key from full URL
   */
  private extractKeyFromUrl(url: string): string | null {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.slice(1);
    } catch {
      return null;
    }
  }

  /**
   * Extract bucket name from URL or return as-is if already a bucket name
   *
   * Handles cases where:
   * - Full URL: https://dev.quick-certify.sfo3.digitaloceanspaces.com -> dev.quick-certify
   * - Bucket name only: dev.quick-certify -> dev.quick-certify
   */
  private extractBucketName(bucketConfig: string): string {
    if (!bucketConfig) return '';

    // If it's a URL, extract the bucket name
    if (bucketConfig.startsWith('http://') || bucketConfig.startsWith('https://')) {
      try {
        const url = new URL(bucketConfig);
        const hostname = url.hostname;

        // For DigitalOcean Spaces format: bucket.region.digitaloceanspaces.com
        // e.g., dev.quick-certify.sfo3.digitaloceanspaces.com
        if (hostname.includes('.digitaloceanspaces.com')) {
          const parts = hostname.split('.');
          // Format: [bucket-parts]...[region].digitaloceanspaces.com
          // Find the index of 'digitaloceanspaces'
          const digitaloceanspacesIndex = parts.indexOf('digitaloceanspaces');
          if (digitaloceanspacesIndex > 0) {
            // Everything before the region (which is before digitaloceanspaces) is the bucket name
            // Region is at index digitaloceanspacesIndex - 1
            // Bucket name is everything before that
            return parts.slice(0, digitaloceanspacesIndex - 1).join('.');
          }
        }

        // Fallback: try to extract from subdomain (first part)
        return hostname.split('.')[0];
      } catch {
        // If URL parsing fails, return as-is (will cause error but at least won't crash)
        return bucketConfig;
      }
    }

    // If it's not a URL, assume it's already a bucket name
    return bucketConfig;
  }

  /**
   * Clean and validate CDN endpoint URL
   *
   * Removes double protocols, trailing slashes, and ensures proper format
   */
  private cleanCdnEndpoint(cdnEndpoint: string): string {
    if (!cdnEndpoint) return '';

    // Remove double protocols (e.g., https://https://)
    let cleaned = cdnEndpoint.replace(/^(https?:\/\/)+/, 'https://');

    // Remove trailing slashes
    cleaned = cleaned.replace(/\/+$/, '');

    // Validate URL format
    try {
      const url = new URL(cleaned);
      return url.origin;
    } catch {
      // If URL parsing fails, try to fix common issues
      // Ensure it starts with https://
      if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        cleaned = `https://${cleaned}`;
      }
      // Remove any remaining double slashes after protocol
      cleaned = cleaned.replace(/(https?:\/\/)\/+/g, '$1');
      return cleaned;
    }
  }

  /**
   * Get file extension from content type
   */
  private getExtensionFromContentType(contentType: string, originalFilename?: string): string {
    // Try to get extension from original filename first
    if (originalFilename) {
      const match = originalFilename.match(/\.[^.]+$/);
      if (match) return match[0].toLowerCase();
    }

    // Fallback to content type mapping
    const typeToExt: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/svg+xml': '.svg',
      'image/x-icon': '.ico',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };

    return typeToExt[contentType] || '.bin';
  }
}
