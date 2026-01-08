'use client';

import { ConfigForm } from '../../../../components/ConfigForm';
import { emailPreferencesFields } from '../../../../config/settings.config';
import {
  emailPreferencesSchema,
  EmailPreferencesData,
} from '../../../../schemas/settings.schema';
import { useEmailPreferences, useUpdateEmailPreferences } from '../../../../hooks/useSettings';
import { FormConfig } from '../../../../types/form.types';

export default function EmailPreferencesPage() {
  const { data: preferences, isLoading } = useEmailPreferences();
  const updatePreferences = useUpdateEmailPreferences();

  const formConfig: FormConfig<typeof emailPreferencesSchema> = {
    title: 'Preferences',
    subtitle: 'Change your personal preferences',
    fields: emailPreferencesFields,
    schema: emailPreferencesSchema,
    submitLabel: 'Save',
    onSubmit: async (data: EmailPreferencesData) => {
      await updatePreferences.mutateAsync(data);
    },
  };

  return (
    <ConfigForm
      config={formConfig}
      initialValues={preferences}
      isLoading={isLoading}
    />
  );
}
