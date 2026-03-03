import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { replaceImage } from '@/lib/image-upload';
import { getApiErrorMessage } from '@/lib/api-error';
import { FileCategory, deleteFile } from '@/services/api/file.service';

interface UseImageUploadOptions {
  category?: FileCategory;
  onSuccess?: (url: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, currentUrl?: string) => {
    setIsUploading(true);
    setError(null);
    try {
      const category = options.category || 'avatar';
      const result = await replaceImage({ file, category }, currentUrl);

      if (result.success && result.url) {
        if (options.onSuccess) {
          await options.onSuccess(result.url);
        }
        return result.url;
      } else {
        setError(result.error || 'Failed to upload image');
        return null;
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to upload image');
      setError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const remove = async (currentUrl: string) => {
    // Note: In some cases we might just want to clear the URL without calling delete API immediately,
    // but the current implementation seems to support direct deletion.
    // If currentUrl comes from backend, we might want to delete it.

    // For now, let's assume the component handles the UI state and this hook handles the API.
    // However, deleteImage util might be needed if we want to clean up S3 files.

    // Logic from original component:
    /*
        const confirmImageDelete = async () => {
            // ... updates state ...
            if (config.onImageDelete) {
                await config.onImageDelete('avatarUrl');
            }
        };
        */

    if (options.onDelete) {
      try {
        await options.onDelete();
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to delete image'));
        return false;
      }
    }
    return true;
  };

  return {
    upload,
    remove,
    isUploading,
    error,
    setError,
  };
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (url: string) => deleteFile(url),
  });
}
