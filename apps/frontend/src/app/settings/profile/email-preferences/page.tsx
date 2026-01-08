'use client';

import { ConfigForm } from '../../../../components/ConfigForm';
import { emailPreferencesFields } from '../../../../config/settings.config';
import {
  emailPreferencesSchema,
  EmailPreferencesData,
} from '../../../../schemas/settings.schema';
import { FormConfig } from '../../../../types/form.types';

export default function EmailPreferencesPage() {
  const formConfig: FormConfig<typeof emailPreferencesSchema> = {
    title: 'Preferences',
    subtitle: 'Change your personal preferences',
    fields: emailPreferencesFields,
    schema: emailPreferencesSchema,
    submitLabel: 'Save',
    onSubmit: async (data: EmailPreferencesData) => {
      // TODO: Integrate when email preferences API is available
      console.log('Email preferences update not implemented yet:', data);
    },
  };

  return (
    <ConfigForm
      config={formConfig}
      initialValues={{ enableAllAlerts: false }}
      isLoading={false}
    />
  );
}
