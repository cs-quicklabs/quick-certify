'use client';

import { useState } from 'react';
import { useOrganizationSettings, useUpdatePortalSettings } from '@/hooks/useAccountSettings';
import { FileDropzone, Alert } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * Issuer Portal Page
 *
 * Allows Super Admins to configure the public issuer portal.
 * Banner is automatically saved to database after successful upload.
 * Old banner is automatically deleted from storage when replaced.
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/issuer-portal
 */
export default function IssuerPortalPage() {
  const { data: settings, isLoading, refetch } = useOrganizationSettings();
  const updatePortalSettings = useUpdatePortalSettings();

  const [portalEnabled, setPortalEnabled] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Use settings value if local state is not set
  const isPortalEnabled = portalEnabled ?? settings?.portal_enabled ?? true;

  // Handle banner change (upload or delete)
  const handleBannerChange = async (url: string | null) => {
    try {
      setSubmitError(null);
      setIsUploading(true);

      await updatePortalSettings.mutateAsync({
        banner_url: url || '',
        portal_enabled: isPortalEnabled,
      });

      setSubmitSuccess('Banner updated successfully!');
      refetch(); // Refresh data
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Failed to update banner'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle portal enabled toggle
  const handlePortalToggle = async (enabled: boolean) => {
    setPortalEnabled(enabled);
    try {
      setSubmitError(null);
      await updatePortalSettings.mutateAsync({
        banner_url: settings?.banner_url || '',
        portal_enabled: enabled,
      });
      setSubmitSuccess('Portal settings updated successfully!');
      refetch();
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Failed to update portal settings'));
      // Revert on error
      setPortalEnabled(null);
    }
  };

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

      {/* Banner Image */}
      <FileDropzone
        label="Banner Image"
        description="Banner image is shown on issuer portal if it is enabled. Recommended size: At least 1920px wide by 300px tall. File type: JPG, JPEG, or PNG. Size: 1920x300"
        accept="image/png,image/jpg,image/jpeg"
        currentImage={settings?.banner_url || null}
        onImageChange={handleBannerChange}
        category="banner"
        maxSizeMB={1}
        imageSize="large"
        dropzoneHeight="large"
        dropzoneWidth="full"
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />

      {/* Enable Issuer Portal Toggle */}
      <div className="flex items-start mb-8">
        <div className="flex items-center h-5">
          <input
            id="portal_enabled"
            type="checkbox"
            checked={isPortalEnabled}
            onChange={(e) => handlePortalToggle(e.target.checked)}
            disabled={isUploading}
            className="mt-2 w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
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
    </div>
  );
}
