'use client';

import { useState, useEffect } from 'react';
import { useEmailPreferences, useUpdateEmailPreferences } from '@/hooks/useSettings';
import { getApiErrorMessage } from '@/lib/api-error';
import { Alert } from '@/components/ui';

/**
 * Email Preferences Page
 *
 * Allows users to manage their email notification preferences.
 * Uses React Query for data fetching and mutation.
 */
export default function EmailPreferencesPage() {
  const { data: preferences, isLoading } = useEmailPreferences();
  const updatePreferences = useUpdateEmailPreferences();

  const [enableAllAlerts, setEnableAllAlerts] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync local state with fetched data
  useEffect(() => {
    if (preferences) {
      setEnableAllAlerts(preferences.enableAllAlerts);
    }
  }, [preferences]);

  const handleCheckboxChange = async (checked: boolean) => {
    setEnableAllAlerts(checked);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await updatePreferences.mutateAsync({ enableAllAlerts: checked });
      setSubmitSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      // Revert checkbox state on error
      setEnableAllAlerts(preferences?.enableAllAlerts ?? false);
      setSubmitError(getApiErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="form-title">Preferences</h1>
      <p className="form-subtitle mb-6">Change your personal preferences</p>

      {submitSuccess && (
        <Alert
          type="success"
          message="Email preferences updated successfully!"
          onClose={() => setSubmitSuccess(false)}
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

      <div className="flex mt-6">
        <div className="flex items-center h-5">
          <input
            id="enableAllAlerts"
            type="checkbox"
            checked={enableAllAlerts}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            disabled={updatePreferences.isPending || isLoading}
            className="checkbox"
          />
        </div>
        <div className="ms-2 text-sm">
          <label htmlFor="enableAllAlerts" className="form-input-label">
            Enable All Email Alerts
          </label>
          <p className="form-input-description -mt-2">
            If disabled, no email alert will land in your inbox.
          </p>
        </div>
      </div>
    </div>
  );
}
