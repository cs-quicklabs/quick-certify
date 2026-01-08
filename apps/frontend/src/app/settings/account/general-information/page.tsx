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
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 text-sm font-medium">Your issuer status has been verified.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-blue-700 text-sm font-medium">
            Your issuer status is currently unverified. It will be verified within next few days but this will not affect any operations till then.
          </p>
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

