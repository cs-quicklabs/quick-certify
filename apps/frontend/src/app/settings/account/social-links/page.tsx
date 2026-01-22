'use client';

import { ConfigForm } from '@/components/ConfigForm';
import { socialLinksFormFields } from '@/config/account-settings.config';
import { socialLinksSchema, SocialLinksFormData } from '@/schemas/account-settings.schema';
import { useOrganizationSettings, useUpdateSocialLinks } from '@/hooks/useAccountSettings';
import { FormConfig } from '@/types/form.types';

/**
 * Social Links Page
 *
 * Allows Super Admins to update organization social links.
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/social-links
 */
export default function SocialLinksPage() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateSocialLinks = useUpdateSocialLinks();

  const formConfig: FormConfig<typeof socialLinksSchema> = {
    title: 'Social Links',
    subtitle:
      'Add social links to your issuer profile. These are shown on various public pages to help users connect with you.',
    fields: socialLinksFormFields,
    schema: socialLinksSchema,
    submitLabel: 'Save',
    onSubmit: async (data: SocialLinksFormData) => {
      await updateSocialLinks.mutateAsync({
        linkedin_url: data.linkedin_url || undefined,
        facebook_url: data.facebook_url || undefined,
        twitter_url: data.twitter_url || undefined,
        website: data.website || undefined,
      });
    },
  };

  // Prepare initial values from settings
  const initialValues = settings
    ? {
        linkedin_url: settings.linkedin_url || '',
        facebook_url: settings.facebook_url || '',
        twitter_url: settings.twitter_url || '',
        website: settings.website,
      }
    : undefined;

  return <ConfigForm config={formConfig} initialValues={initialValues} isLoading={isLoading} />;
}
