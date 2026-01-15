'use client';

import { useState } from 'react';
import { useOrganizationSettings, useUpdateBranding } from '@/hooks/useAccountSettings';
import { FileDropzone, Alert } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * Branding Page
 *
 * Allows Super Admins to update organization branding (logo, favicon).
 * Images are automatically saved to database after successful upload.
 * Old images are automatically deleted from storage when replaced.
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/branding
 */
export default function BrandingPage() {
  const { data: settings, isLoading, refetch } = useOrganizationSettings();
  const updateBranding = useUpdateBranding();

  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Handle logo change (upload or delete)
  const handleLogoChange = async (url: string | null) => {
    try {
      setSubmitError(null);
      setIsUploading(true);

      await updateBranding.mutateAsync({
        logo_url: url || '',
      });

      setSubmitSuccess('Logo updated successfully!');
      refetch(); // Refresh data
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Failed to update logo'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle favicon change (upload or delete)
  const handleFaviconChange = async (url: string | null) => {
    try {
      setSubmitError(null);
      setIsUploading(true);

      await updateBranding.mutateAsync({
        favicon_url: url || '',
      });

      setSubmitSuccess('Favicon updated successfully!');
      refetch(); // Refresh data
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Failed to update favicon'));
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="w-64 h-40 bg-gray-200 rounded mb-8"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="w-64 h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="form-title">Branding</h1>
      <p className="form-subtitle mb-6">Add issuer logo and other brand related information</p>

      {submitSuccess && (
        <Alert
          type="success"
          message={submitSuccess}
          onClose={() => setSubmitSuccess(null)}
          className="mb-6"
        />
      )}

      {submitError && (
        <Alert
          type="error"
          message={submitError}
          onClose={() => setSubmitError(null)}
          className="mb-6"
        />
      )}

      {/* Issuer Logo */}
      <FileDropzone
        label="Issuer Logo"
        description="Your logo appears on your issuer page, and with all published credentials on Quick Certify. Recommended size: Square, at least 400 pixels per side. File type: JPG, JPEG, or PNG"
        accept="image/png,image/jpg,image/jpeg"
        currentImage={settings?.logo_url || null}
        onImageChange={handleLogoChange}
        category="logo"
        maxSizeMB={1}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />

      {/* Favicon */}
      <FileDropzone
        label="Favicon"
        description="We accept SVG, JPG and PNG files up to 1 MB."
        accept="image/svg+xml,image/png,image/jpg,image/jpeg"
        currentImage={settings?.favicon_url || null}
        onImageChange={handleFaviconChange}
        category="favicon"
        maxSizeMB={1}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />
    </div>
  );
}
