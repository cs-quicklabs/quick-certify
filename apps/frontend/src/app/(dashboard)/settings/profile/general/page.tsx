'use client';
import { ConfigForm } from '@/components/ConfigForm';
import { profileFormFields } from '@/config/settings.config';
import { useProfile, useUpdateProfile } from '@/hooks/useSettings';
import { ProfileSettingsData, profileSettingsSchema } from '@/schemas/settings.schema';
import { FormConfig } from '@/types';

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
        await updateProfile.mutateAsync({
          firstName: profile.firstName,
          avatarUrl: undefined,
        });
      }
    },
  };

  return <ConfigForm config={formConfig} initialValues={profile} isLoading={isLoading} />;
}
