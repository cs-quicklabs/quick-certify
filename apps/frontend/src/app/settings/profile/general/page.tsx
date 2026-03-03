'use client';

import { ConfigForm } from '../../../../components/ConfigForm';
import { profileFormFields } from '../../../../config/settings.config';
import { profileSettingsSchema, ProfileSettingsData } from '../../../../schemas/settings.schema';
import { useProfile, useUpdateProfile } from '../../../../hooks/useSettings';
import { FormConfig } from '../../../../types/form.types';
import { useDeleteFile } from '../../../../hooks/useImageUpload';

/**
 * Profile Settings Page
 *
 * Allows users to update their personal profile information including
 * avatar, first name, last name, and email.
 */
export default function ProfileSettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const deleteFile = useDeleteFile();

  const formConfig: FormConfig<typeof profileSettingsSchema> = {
    title: 'Profile Settings',
    subtitle: 'Change your personal profile settings',
    fields: profileFormFields,
    schema: profileSettingsSchema,
    submitLabel: 'Save',
    onSubmit: async (data: ProfileSettingsData) => {
      await updateProfile.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl && data.avatarUrl.trim() !== '' ? data.avatarUrl : undefined,
      });
    },

    onImageUpload: async (fieldName: string, imageUrl: string) => {
      if (fieldName === 'avatarUrl' && profile?.firstName) {
        await updateProfile.mutateAsync({
          firstName: profile.firstName,
          avatarUrl: imageUrl,
        });
      }
    },

    onImageDelete: async (fieldName: string) => {
      if (fieldName === 'avatarUrl' && profile?.firstName) {
        if (profile.avatarUrl) {
          try {
            await deleteFile.mutateAsync(profile.avatarUrl);
          } catch {
            // Silently fail — storage deletion is best-effort
          }
        }
        await updateProfile.mutateAsync({
          firstName: profile.firstName,
          avatarUrl: null,
        });
      }
    },
  };

  return <ConfigForm config={formConfig} initialValues={profile} isLoading={isLoading} />;
}
