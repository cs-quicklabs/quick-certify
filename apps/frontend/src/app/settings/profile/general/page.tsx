'use client';

import { Navbar } from '../../../../components/Navbar';
import { Sidebar } from '../../../../components/Sidebar';
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
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="px-2 py-6 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <Sidebar />
          </aside>
          <div className="max-w-xl pb-12 px-4 lg:col-span-6">
            <ConfigForm
              config={formConfig}
              initialValues={profile}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </>
  );
}
