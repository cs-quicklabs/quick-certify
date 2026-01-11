import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

/**
 * Storage Configuration Type
 */
export interface StorageConfig {
  provider: 'digitalocean' | 's3' | 'local';
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  endpoint: string;
  cdnEndpoint?: string;
}

/**
 * Environment Variables Validator for Storage
 */
export class StorageEnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  STORAGE_PROVIDER?: string = 'digitalocean';

  @ValidateIf((o) => o.STORAGE_PROVIDER !== 'local')
  @IsString()
  @IsNotEmpty()
  DO_SPACES_ACCESS_KEY?: string;

  @ValidateIf((o) => o.STORAGE_PROVIDER !== 'local')
  @IsString()
  @IsNotEmpty()
  DO_SPACES_SECRET_KEY?: string;

  @ValidateIf((o) => o.STORAGE_PROVIDER !== 'local')
  @IsString()
  @IsNotEmpty()
  DO_SPACES_BUCKET?: string;

  @ValidateIf((o) => o.STORAGE_PROVIDER !== 'local')
  @IsString()
  @IsOptional()
  DO_SPACES_REGION?: string = 'sfo3';

  @IsString()
  @IsOptional()
  DO_SPACES_CDN_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  DO_SPACES_USE_CDN?: string; // Set to 'true' to use CDN endpoint (requires CDN to be enabled on DigitalOcean)
}

/**
 * Extract bucket name from URL or return as-is
 */
function extractBucketName(bucketConfig: string): string {
  if (!bucketConfig) return '';

  // If it's a URL, extract the bucket name
  if (bucketConfig.startsWith('http://') || bucketConfig.startsWith('https://')) {
    try {
      const url = new URL(bucketConfig);
      const hostname = url.hostname;

      // For DigitalOcean Spaces format: bucket.region.digitaloceanspaces.com
      if (hostname.includes('.digitaloceanspaces.com')) {
        const parts = hostname.split('.');
        const digitaloceanspacesIndex = parts.indexOf('digitaloceanspaces');
        if (digitaloceanspacesIndex > 0) {
          // Everything before the region is the bucket name
          return parts.slice(0, digitaloceanspacesIndex - 1).join('.');
        }
      }

      // Fallback: try to extract from subdomain (first part)
      return hostname.split('.')[0];
    } catch {
      // If URL parsing fails, return as-is
      return bucketConfig;
    }
  }

  // If it's not a URL, assume it's already a bucket name
  return bucketConfig;
}

/**
 * Clean and validate CDN endpoint URL
 * 
 * Note: CDN endpoint only works if CDN is enabled for the Space.
 * If CDN is not enabled, use the regular Spaces endpoint instead.
 * 
 * Regular endpoint format: https://bucket.region.digitaloceanspaces.com
 * CDN endpoint format: https://bucket.region.cdn.digitaloceanspaces.com
 */
function cleanCdnEndpoint(
  cdnEndpoint: string | undefined,
  bucket: string,
  region: string,
  useCdn: boolean = false,
): string {
  // If CDN is explicitly enabled and CDN endpoint is provided
  if (useCdn && cdnEndpoint) {
    // If it's already a full URL, clean it
    if (cdnEndpoint.startsWith('http://') || cdnEndpoint.startsWith('https://')) {
      try {
        const url = new URL(cdnEndpoint);
        return url.origin;
      } catch {
        let cleaned = cdnEndpoint.replace(/^(https?:\/\/)+/, 'https://');
        cleaned = cleaned.replace(/\/+$/, '');
        return cleaned;
      }
    }

    // If it's a domain, construct full URL
    if (cdnEndpoint.includes('.')) {
      return `https://${cdnEndpoint.replace(/\/+$/, '')}`;
    }

    // Construct CDN endpoint
    if (bucket) {
      return `https://${bucket}.${region}.cdn.digitaloceanspaces.com`;
    }
  }

  // Default: Use regular Spaces endpoint (works without CDN setup)
  // This is more reliable and doesn't require CDN configuration
  if (bucket) {
    return `https://${bucket}.${region}.digitaloceanspaces.com`;
  }

  return '';
}

/**
 * Storage Configuration Factory
 */
export default registerAs<StorageConfig>('storage', () => {
  const region = process.env.DO_SPACES_REGION || 'sfo3';
  const bucketConfig = process.env.DO_SPACES_BUCKET || '';
  
  // Extract bucket name (handle both URL and bucket name formats)
  const bucket = extractBucketName(bucketConfig);

  // Check if CDN should be used (default: false - use regular endpoint)
  const useCdn = process.env.DO_SPACES_USE_CDN === 'true';

  // Clean and construct endpoint (CDN or regular)
  const cdnEndpoint = cleanCdnEndpoint(
    process.env.DO_SPACES_CDN_ENDPOINT,
    bucket,
    region,
    useCdn,
  );

  return {
    provider: (process.env.STORAGE_PROVIDER as StorageConfig['provider']) || 'digitalocean',
    accessKey: process.env.DO_SPACES_ACCESS_KEY || '',
    secretKey: process.env.DO_SPACES_SECRET_KEY || '',
    bucket,
    region,
    endpoint: `https://${region}.digitaloceanspaces.com`,
    cdnEndpoint,
  };
});

