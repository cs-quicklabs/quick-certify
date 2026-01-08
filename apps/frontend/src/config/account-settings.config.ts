import { FormFieldConfig } from '../types/form.types';

/**
 * General Information Form Fields
 *
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/general-information
 */
export const generalInfoFormFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Issuer or Organisation Name',
    type: 'text',
    placeholder: 'Enter your organization name',
    required: true,
  },
  {
    name: 'description',
    label: 'Issuer Description',
    type: 'textarea',
    placeholder: 'Write a few words about your organization...',
    description:
      'This description will be displayed on each credential page under your organization\'s name.',
    rows: 4,
  },
  {
    name: 'support_email',
    label: 'Support Email',
    type: 'email',
    placeholder: 'support@company.com',
    description:
      'Enter the preferred email address your recipients can use to contact you regarding changes or problems with their credential.',
  },
  {
    name: 'slogan',
    label: 'Slogan',
    type: 'text',
    placeholder: 'Your company slogan',
  },
  {
    name: 'linkedin_company_id',
    label: 'LinkedIn Company ID',
    type: 'text',
    placeholder: '12345678',
    description:
      'To find your LinkedIn Company ID, open your company\'s profile being logged in as an admin, and copy the numbers before "/admin" in the URL.',
  },
];

/**
 * Social Links Form Fields
 *
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/social-links
 */
export const socialLinksFormFields: FormFieldConfig[] = [
  {
    name: 'linkedin_url',
    label: 'LinkedIn Profile Link',
    type: 'url',
    placeholder: 'https://linkedin.com/company/your-company',
  },
  {
    name: 'facebook_url',
    label: 'Facebook Profile Link',
    type: 'url',
    placeholder: 'https://facebook.com/your-page',
  },
  {
    name: 'twitter_url',
    label: 'Twitter/X Profile Link',
    type: 'url',
    placeholder: 'https://twitter.com/your-handle',
  },
  {
    name: 'website',
    label: 'Website Link',
    type: 'url',
    placeholder: 'https://www.company.com',
  },
];

/**
 * Branding Form Fields
 *
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/branding
 */
export const brandingFormFields: FormFieldConfig[] = [
  {
    name: 'logo_url',
    label: 'Issuer Logo',
    type: 'file',
    accept: 'image/png,image/jpg,image/jpeg',
    description:
      'Your logo appears on your issuer page, and with all published credentials. Recommended size: Square, at least 400 pixels per side. File type: JPG, JPEG, or PNG. Max size: 1MB',
  },
  {
    name: 'favicon_url',
    label: 'Favicon',
    type: 'file',
    accept: 'image/svg+xml,image/png,image/jpg,image/jpeg',
    description: 'We accept SVG, JPG and PNG files up to 1 MB.',
  },
];

/**
 * Portal Settings Form Fields
 *
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/issuer-portal
 */
export const portalSettingsFormFields: FormFieldConfig[] = [
  {
    name: 'banner_url',
    label: 'Banner Image',
    type: 'file',
    accept: 'image/png,image/jpg,image/jpeg',
    description:
      'Banner image is shown on issuer portal if it is enabled. Recommended size: At least 1920px wide by 300px tall. File type: JPG, JPEG, or PNG',
  },
  {
    name: 'portal_enabled',
    label: 'Enable Issuer Portal',
    type: 'checkbox',
    description:
      'If disabled, there will be no public page to showcase public events limiting your reach. Issuer portal is enabled by default.',
  },
];

