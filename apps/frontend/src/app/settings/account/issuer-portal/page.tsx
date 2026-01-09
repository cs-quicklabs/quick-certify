'use client';

import { useState, useRef, useCallback } from 'react';
import { useOrganizationSettings, useUpdatePortalSettings } from '@/hooks/useAccountSettings';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * File Upload Dropzone Component for Banner
 */
interface BannerDropzoneProps {
  label: string;
  description: string;
  accept: string;
  currentImage?: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  maxSizeMB?: number;
}

function BannerDropzone({
  label,
  description,
  accept,
  currentImage,
  onFileSelect,
  onRemove,
  maxSizeMB = 1,
}: BannerDropzoneProps) {
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
              className="max-w-full max-h-48 object-contain border border-gray-200 rounded-lg"
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
 * Issuer Portal Page
 *
 * Allows Super Admins to configure the public issuer portal.
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/issuer-portal
 */
export default function IssuerPortalPage() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updatePortalSettings = useUpdatePortalSettings();

  // Note: bannerFile would be used when integrating with a file upload service
  const [, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [portalEnabled, setPortalEnabled] = useState<boolean | null>(null);
  const [removeBanner, setRemoveBanner] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Use settings value if local state is not set
  const isPortalEnabled = portalEnabled ?? settings?.portal_enabled ?? true;

  const handleBannerSelect = (file: File) => {
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setRemoveBanner(false);
  };

  const handleBannerRemove = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setRemoveBanner(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const updateData: { banner_url?: string; portal_enabled: boolean } = {
        portal_enabled: isPortalEnabled,
      };

      if (removeBanner) {
        updateData.banner_url = '';
      } else if (bannerPreview) {
        // In real implementation, upload file and get URL
        updateData.banner_url = bannerPreview;
      }

      await updatePortalSettings.mutateAsync(updateData);
      setSubmitSuccess(true);

      // Reset local state
      setBannerFile(null);
      setRemoveBanner(false);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine what to show for banner
  const displayBanner = bannerPreview || (!removeBanner && settings?.banner_url) || null;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-48 bg-gray-200 rounded mb-8"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="form-title">Issuer Portal</h1>
      <p className="form-subtitle mb-6">
        Issuer Portal is a public page where all the public events are visible to the internet.
      </p>

      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
          <p className="text-green-700 text-sm">Portal settings updated successfully!</p>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Banner Image */}
        <BannerDropzone
          label="Banner Image"
          description="Banner image is shown on issuer portal if it is enabled. Recommended size: At least 1920px wide by 300px tall. File type: JPG, JPEG, or PNG. Size: 1920x300"
          accept="image/png,image/jpg,image/jpeg"
          currentImage={displayBanner}
          onFileSelect={handleBannerSelect}
          onRemove={handleBannerRemove}
          maxSizeMB={1}
        />

        {/* Enable Issuer Portal Toggle */}
        <div className="flex items-start mb-8">
          <div className="flex items-center h-5">
            <input
              id="portal_enabled"
              type="checkbox"
              checked={isPortalEnabled}
              onChange={(e) => setPortalEnabled(e.target.checked)}
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="portal_enabled" className="text-sm font-medium text-gray-900 dark:text-white">
              Enable Issuer Portal
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If disabled, there will be no public page to showcase public events limiting your reach.
              Issuer portal is enabled by default.
            </p>
          </div>
        </div>

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
