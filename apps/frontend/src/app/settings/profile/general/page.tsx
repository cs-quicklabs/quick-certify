'use client';

import { ConfigForm } from '../../../../components/ConfigForm';
import { profileFormFields } from '../../../../config/settings.config';
import { profileSettingsSchema, ProfileSettingsData } from '../../../../schemas/settings.schema';
import { useProfile, useUpdateProfile } from '../../../../hooks/useSettings';
import { FormConfig } from '../../../../types/form.types';

/**
 * Profile Settings Page
 *
 * Allows users to update their personal profile information including
 * avatar, first name, last name, and email.
 */
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
      await updateProfile.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName && data.lastName.trim() !== '' ? data.lastName : undefined,
        avatarUrl: data.avatarUrl && data.avatarUrl.trim() !== '' ? data.avatarUrl : undefined,
      });
    },
    onImageUpload: async (fieldName: string, imageUrl: string) => {
      // Save avatar URL to database immediately after upload
      if (fieldName === 'avatarUrl') {
        await updateProfile.mutateAsync({
          avatarUrl: imageUrl,
        });
      }
    },
    onImageDelete: async (fieldName: string) => {
      // Remove avatar URL from database immediately after deletion
      // Pass null explicitly to indicate deletion
      if (fieldName === 'avatarUrl') {
        await updateProfile.mutateAsync({
          avatarUrl: null as any, // Explicitly set to null for deletion - mutation accepts null
        });
      }
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
