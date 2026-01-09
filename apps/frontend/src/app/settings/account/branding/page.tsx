'use client';

import { useState, useRef, useCallback } from 'react';
import { useOrganizationSettings, useUpdateBranding } from '@/hooks/useAccountSettings';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * File Upload Dropzone Component
 */
interface FileDropzoneProps {
  label: string;
  description: string;
  accept: string;
  currentImage?: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  maxSizeMB?: number;
}

function FileDropzone({
  label,
  description,
  accept,
  currentImage,
  onFileSelect,
  onRemove,
  maxSizeMB = 1,
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
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
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-8">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
        {label}
      </label>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>

      {/* Show current image if exists */}
      {currentImage ? (
        <div className="mb-4">
          <div className="relative inline-block">
            <img
              src={currentImage}
              alt={label}
              className="max-w-xs max-h-32 object-contain border border-gray-200 rounded-lg"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="block mt-2 text-sm text-primary-600 hover:underline"
          >
            Change image
          </button>
        </div>
      ) : (
        /* Upload dropzone */
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center w-full h-48 
            border-2 border-dashed rounded-lg cursor-pointer 
            transition-colors
            ${isDragging 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'
            }
          `}
        >
          {/* Upload Icon */}
          <svg
            className="w-10 h-10 mb-3 text-gray-400"
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
            <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Max. File Size: {maxSizeMB}MB</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

/**
 * Branding Page
 *
 * Allows Super Admins to update organization branding (logo, favicon).
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/branding
 */
export default function BrandingPage() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateBranding = useUpdateBranding();

  // Note: logoFile and faviconFile would be used when integrating with a file upload service
  const [, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Track if images should be removed
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeFavicon, setRemoveFavicon] = useState(false);

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  };

  const handleFaviconSelect = (file: File) => {
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
    setRemoveFavicon(false);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleFaviconRemove = () => {
    setFaviconFile(null);
    setFaviconPreview(null);
    setRemoveFavicon(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // For now, we're just updating with URLs
      // In a real implementation, you'd upload files to a storage service first
      const updateData: { logo_url?: string; favicon_url?: string } = {};

      if (removeLogo) {
        updateData.logo_url = '';
      } else if (logoPreview) {
        // In real implementation, upload file and get URL
        updateData.logo_url = logoPreview;
      }

      if (removeFavicon) {
        updateData.favicon_url = '';
      } else if (faviconPreview) {
        // In real implementation, upload file and get URL
        updateData.favicon_url = faviconPreview;
      }

      await updateBranding.mutateAsync(updateData);
      setSubmitSuccess(true);

      // Reset local state
      setLogoFile(null);
      setFaviconFile(null);
      setRemoveLogo(false);
      setRemoveFavicon(false);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine what to show for logo
  const displayLogo = logoPreview || (!removeLogo && settings?.logo_url) || null;
  const displayFavicon = faviconPreview || (!removeFavicon && settings?.favicon_url) || null;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-48 bg-gray-200 rounded mb-8"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="form-title">Branding</h1>
      <p className="form-subtitle mb-6">Add issuer logo and other brand related information</p>

      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
          <p className="text-green-700 text-sm">Branding updated successfully!</p>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Issuer Logo */}
        <FileDropzone
          label="Issuer Logo"
          description="Your logo appears on your issuer page, and with all published credentials on Quick Certify. Recommended size: Square, at least 400 pixels per side. File type: JPG, JPEG, or PNG"
          accept="image/png,image/jpg,image/jpeg"
          currentImage={displayLogo}
          onFileSelect={handleLogoSelect}
          onRemove={handleLogoRemove}
          maxSizeMB={1}
        />

        {/* Favicon */}
        <FileDropzone
          label="Favicon"
          description="We accept SVG, JPG and PNG files up to 1 MB."
          accept="image/svg+xml,image/png,image/jpg,image/jpeg"
          currentImage={displayFavicon}
          onFileSelect={handleFaviconSelect}
          onRemove={handleFaviconRemove}
          maxSizeMB={1}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
