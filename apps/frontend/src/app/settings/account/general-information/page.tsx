'use client';

import { ConfigForm } from '@/components/ConfigForm';
import { generalInfoFormFields } from '@/config/account-settings.config';
import { generalInfoSchema, GeneralInfoFormData } from '@/schemas/account-settings.schema';
import { useOrganizationSettings, useUpdateGeneralInfo } from '@/hooks/useAccountSettings';
import { FormConfig } from '@/types/form.types';

/**
 * General Information Page
 *
 * Allows Super Admins to update organization general information.
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/general-information
 */
export default function GeneralInformationPage() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateGeneralInfo = useUpdateGeneralInfo();

  // Show verification status alerts
  const renderStatusAlerts = () => {
    if (!settings) return null;

    if (settings.issuer_verified) {
      return (
        <div
          className="flex items-center p-2.5 mb-4 text-sm text-green-800 border border-green-300 rounded-sm bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
          role="alert"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-circle-check shrink-0 inline w-4 h-4 me-2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium"></span> Your issuer status has been verified.
          </div>
        </div>
      );
    }

    return (
      <div
        className="flex items-center p-2.5 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-sm bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800"
        role="alert"
      >
        <svg
          className="lucide lucide-triangle-alert shrink-0 inline w-4 h-4 me-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <span className="sr-only">Info</span>
        <div>
          <span className="font-medium"></span> Your issuer status is currently unverified. It will
          be verified within next few days but this will not affect any operations till then.
        </div>
      </div>
    );
  };

  const formConfig: FormConfig<typeof generalInfoSchema> = {
    title: 'General Information',
    subtitle: 'Add more details about the organisation or the certificate issuer',
    fields: generalInfoFormFields,
    schema: generalInfoSchema,
    submitLabel: 'Save',
    onSubmit: async (data: GeneralInfoFormData) => {
      await updateGeneralInfo.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        support_email: data.support_email || undefined,
        slogan: data.slogan || undefined,
        linkedin_company_id: data.linkedin_company_id || undefined,
      });
    },
  };

  // Prepare initial values from settings
  const initialValues = settings
    ? {
        name: settings.name || '',
        description: settings.description || '',
        support_email: settings.support_email || '',
        slogan: settings.slogan || '',
        linkedin_company_id: settings.linkedin_company_id || '',
      }
    : undefined;

  return (
    <div>
      {renderStatusAlerts()}
      <ConfigForm config={formConfig} initialValues={initialValues} isLoading={isLoading} />
    </div>
  );
}
