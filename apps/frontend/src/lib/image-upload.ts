import { uploadFile, deleteFile, FileCategory, FileUploadResult } from '@/services/api/file.service';
import { DesignType, validateImageDimensions } from '@/lib/design/';
import { getApiErrorMessage } from './api-error';

/**
 * Image Upload Options
 */
export interface ImageUploadOptions {
  file: File;
  category: FileCategory;
  designType?: DesignType;
  validateDimensions?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Image Upload Result
 */
export interface ImageUploadResult {
  url: string;
  success: boolean;
  error?: string;
}

/**
 * Generic function to upload an image
 *
 * @param options - Upload options including file, category, and optional progress callback
 * @returns Upload result with URL or error
 */
export async function uploadImage(options: ImageUploadOptions): Promise<ImageUploadResult> {
  const { file, category, designType, validateDimensions = false } = options;

  try {

    if (validateDimensions && designType) {
      await validateImageDimensions(file, designType);
    }

    const result: FileUploadResult = await uploadFile(file, category);
    return {
      url: result.url,
      success: true,
    };
  } catch (error) {
    return {
      url: '',
      success: false,
      error: getApiErrorMessage(error, 'Failed to upload image'),
    };
  }
}

/**
 * Generic function to delete an image from storage
 *
 * @param url - Full URL of the image to delete
 * @returns Success status and optional error message
 */
export async function deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
  if (!url) {
    return { success: true }; // No URL means nothing to delete
  }

  try {
    await deleteFile(url);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getApiErrorMessage(error, 'Failed to delete image'),
    };
  }
}

/**
 * Replace an image: uploads new image and deletes old one
 *
 * @param options - Upload options
 * @param oldImageUrl - URL of the old image to delete (optional)
 * @returns Upload result with URL or error
 */
export async function replaceImage(
  options: ImageUploadOptions,
  oldImageUrl?: string | null,
): Promise<ImageUploadResult> {
  // Upload new image first
  const uploadResult = await uploadImage(options);

  if (!uploadResult.success) {
    return uploadResult;
  }

  // Delete old image if it exists and is different from new one
  if (oldImageUrl && oldImageUrl !== uploadResult.url) {
    await deleteImage(oldImageUrl).catch(() => {
      // Silently fail - old image deletion is not critical
      // Log error in production if needed
    });
  }

  return uploadResult;
}

