'use client';

import { ConfigForm } from '../../../../components/ConfigForm';
import { profileFormFields } from '../../../../config/settings.config';
import { profileSettingsSchema, ProfileSettingsData } from '../../../../schemas/settings.schema';
import { useProfile, useUpdateProfile } from '../../../../hooks/useSettings';
import { FormConfig } from '../../../../types/form.types';

export default function ProfileSettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const formConfig: FormConfig<typeof profileSettingsSchema> = {
    title: 'Profile Settings',
    subtitle: 'Change your personal profile settings',
    fields: profileFormFields,
    schema: profileSettingsSchema,
    submitLabel: 'Save',
    onSubmit: async (data: ProfileSettingsData) => {
      await updateProfile.mutateAsync(data);
    },
  };

  return (
    <ConfigForm
      config={formConfig}
      initialValues={profile}
      isLoading={isLoading}
    />
  );
}
