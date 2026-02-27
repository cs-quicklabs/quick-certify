'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FileCategory } from '@/services/api/file.service';
import { deleteImage, replaceImage } from '@/lib/image-upload';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * File Dropzone Component Props
 */
export interface FileDropzoneProps {
  /** Label for the dropzone */
  label: string;
  /** Description text below the label */
  description: string;
  /** Accepted file types (e.g., "image/png,image/jpg") */
  accept: string;
  /** Current image URL to display */
  currentImage?: string | null;
  /** Callback when image changes (uploaded or deleted) */
  onImageChange: (url: string | null) => void;
  /** File category for upload */
  category: FileCategory;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** External uploading state (for parent component control) */
  isUploading?: boolean;
  /** Callback to update external uploading state */
  setIsUploading?: (value: boolean) => void;
  /** Image display size variant */
  imageSize?: 'small' | 'large';
  /** Dropzone height variant */
  dropzoneHeight?: 'small' | 'large';
  /** Dropzone width variant */
  dropzoneWidth?: 'small' | 'full';
  /** Custom className for the container */
  className?: string;
}

/**
 * File Dropzone Component
 *
 * A reusable component for uploading, displaying, and deleting images.
 * Supports drag-and-drop, file validation, and automatic image replacement.
 *
 * @example
 * ```tsx
 * <FileDropzone
 *   label="Logo"
 *   description="Upload your logo"
 *   accept="image/png,image/jpg"
 *   currentImage={logoUrl}
 *   onImageChange={handleLogoChange}
 *   category="logo"
 *   maxSizeMB={10}
 *   imageSize="small"
 *   dropzoneWidth="small"
 *   dropzoneHeight="small"
 * />
 * ```
 */
export function FileDropzone({
  label,
  description,
  accept,
  currentImage,
  onImageChange,
  category,
  maxSizeMB = 10,
  isUploading = false,
  setIsUploading,
  imageSize = 'small',
  dropzoneHeight = 'small',
  dropzoneWidth = 'full',
  className = '',
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Image size classes based on variant
  // Small: 256px (w-64) wide by 160px (h-40) tall
  // Large: 1920px wide by 300px tall (banner aspect ratio)
  const imageSizeClasses = {
    small: 'w-64 h-40',
    large: 'w-full h-[160px]',
  };

  // Placeholder size classes based on variant
  // Small: 256px (w-64) wide by 160px (h-40) tall
  // Large: 1920px wide by 300px tall (banner aspect ratio)
  const placeholderSizeClasses = {
    small: 'w-64 h-40',
    large: 'w-full h-[160px]',
  };

  // Dropzone height classes
  // Large: 300px height to match banner dimensions
  const dropzoneHeightClasses = {
    small: 'w-64 h-40',
    large: 'h-[160px]',
  };

  // Dropzone width classes
  const dropzoneWidthClasses = {
    small: 'w-64',
    full: 'w-full',
  };

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(
          `File size must be less than ${maxSizeMB}MB, current size is ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB`,
        );
        return false;
      }

      // Check file type
      const allowedTypes = accept.split(',').map((t) => t.trim());
      const fileType = file.type;
      if (!allowedTypes.some((type) => fileType.match(type.replace('*', '.*')))) {
        setError('Invalid file type. Please upload a valid image.');
        return false;
      }

      setError(null);
      return true;
    },
    [maxSizeMB, accept],
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      setUploading(true);
      setIsUploading?.(true);
      setError(null);

      try {
        // Replace image: uploads new and deletes old
        const result = await replaceImage({ file, category }, currentImage || undefined);

        if (result.success) {
          onImageChange(result.url);
        } else {
          setError(result.error || 'Failed to upload image');
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to upload file'));
      } finally {
        setUploading(false);
        setIsUploading?.(false);
      }
    },
    [validateFile, category, currentImage, onImageChange, setIsUploading],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input to allow re-selecting same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload],
  );

  const handleClick = () => {
    if (!uploading && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveClick = async () => {
    if (!currentImage) return;

    setIsUploading?.(true);
    setError(null);

    try {
      // Delete from storage
      const deleteResult = await deleteImage(currentImage);

      if (deleteResult.success) {
        // Update parent component (will save to DB)
        onImageChange(null);
      } else {
        setError(deleteResult.error || 'Failed to delete image');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete image'));
    } finally {
      setIsUploading?.(false);
    }
  };

  // Reset loading state when image changes
  useEffect(() => {
    if (currentImage) {
      setImageLoading(true);
      setImageError(false);
    } else {
      setImageLoading(false);
      setImageError(false);
    }
  }, [currentImage]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const isDisabled = uploading || isUploading;

  return (
    <div className={`mb-6 ${className}`}>
      <label className="form-input-label mb-2">{label}</label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>

      {/* Show current image if exists */}
      {currentImage ? (
        <div className="mb-4">
          <div className={`relative ${imageSize === 'small' ? 'w-64' : 'w-full'}`}>
            {/* Image placeholder/skeleton while loading */}
            {imageLoading && (
              <div
                className={`${placeholderSizeClasses[imageSize]} flex items-center justify-center bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md animate-pulse`}
              >
                <svg
                  className={`${imageSize === 'small' ? 'w-8 h-8' : 'w-12 h-12'} text-gray-400`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Actual image */}
            <img
              ref={(el) => {
                if (el?.complete && el.naturalWidth > 0 && imageLoading) {
                  handleImageLoad();
                }
              }}
              src={currentImage}
              alt={label}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`${
                imageSizeClasses[imageSize]
              } object-cover border border-gray-200 dark:border-gray-600 rounded-md transition-opacity duration-300 ${
                imageLoading ? 'opacity-0 absolute' : imageError ? 'opacity-50' : 'opacity-100'
              }`}
            />

            {/* Error state */}
            {imageError && !imageLoading && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 ${
                  imageSize === 'large' ? 'min-w-[200px] min-h-[120px]' : ''
                }`}
              >
                <div className="text-center p-2">
                  <svg
                    className={`${
                      imageSize === 'small' ? 'w-6 h-6' : 'w-8 h-8'
                    } text-gray-400 mx-auto mb-1`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs text-gray-500">Failed to load</p>
                </div>
              </div>
            )}

            {/* Remove button - only show when image is loaded */}
            {!imageLoading && !imageError && (
              <button
                type="button"
                onClick={handleRemoveClick}
                disabled={isDisabled}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-md p-1 hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className="block mt-2 text-sm text-primary-600 hover:underline disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Change image'}
          </button>
        </div>
      ) : (
        /* Upload dropzone */
        <div className={`flex justify-center items-center ${imageSizeClasses[imageSize]}`}>
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center ${
              dropzoneWidthClasses[dropzoneWidth]
            } ${
              dropzoneHeightClasses[dropzoneHeight]
            } border-2 border-dashed rounded-md transition-colors
                            ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                            ${
                              isDragging
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'
                            }`}
          >
            {uploading ? (
              <>
                <svg
                  className="w-10 h-10 mb-3 text-gray-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                {/* Upload Icon */}
                <svg
                  className="w-10 h-10 mb-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-black-600">Click to upload</span> or drag and
                  drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {category === 'banner' ? 'Size: 1920x300' : `Max. File Size: ${maxSizeMB}MB`}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isDisabled}
      />

      {/* Error message */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
