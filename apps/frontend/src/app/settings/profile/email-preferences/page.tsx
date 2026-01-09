'use client';

import { useState, useEffect } from 'react';
import { useEmailPreferences, useUpdateEmailPreferences } from '@/hooks/useSettings';
import { getApiErrorMessage } from '@/lib/api-error';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync local state with fetched data
  useEffect(() => {
    if (preferences) {
      setEnableAllAlerts(preferences.enableAllAlerts);
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await updatePreferences.mutateAsync({ enableAllAlerts });
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="form-title">Preferences</h1>
      <p className="form-subtitle mb-6">Change your personal preferences</p>

      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
          <p className="text-green-700 text-sm">Email preferences updated successfully!</p>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-start mb-6">
          <div className="flex items-center h-5">
            <input
              id="enableAllAlerts"
              type="checkbox"
              checked={enableAllAlerts}
              onChange={(e) => setEnableAllAlerts(e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
            />
          </div>
          <div className="ml-3">
            <label
              htmlFor="enableAllAlerts"
              className="text-sm font-medium text-gray-900 dark:text-white"
            >
              Enable All Email Alerts
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If disabled, no email alert will land in your inbox.
            </p>
          </div>
        </div>

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
