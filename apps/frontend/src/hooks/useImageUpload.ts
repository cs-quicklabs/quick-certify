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

  const remove = async (currentUrl?: string) => {
    try {
      if (options.onDelete) {
        await options.onDelete();
      } else if (currentUrl) {
        await deleteFile(currentUrl);
      }
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete image'));
      return false;
    }
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
