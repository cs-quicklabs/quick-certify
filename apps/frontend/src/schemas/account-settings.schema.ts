import { z } from 'zod';

/**
 * Social Link URL Validators
 */
const linkedinUrlRegex = /^https?:\/\/(www\.)?linkedin\.com\/(company|in|school)\/[\w-]+\/?$/i;
const facebookUrlRegex = /^https?:\/\/(www\.)?(facebook|fb)\.com\/[\w.-]+\/?$/i;
const twitterUrlRegex = /^https?:\/\/(www\.)?(twitter|x)\.com\/[\w]+\/?$/i;
const websiteUrlRegex = /^https?:\/\/.+$/i;

/**
 * General Information Schema
 */
export const generalInfoSchema = z.object({
  name: z
    .string()
    .regex(/\S/, 'Organization name must not be only spaces')
    .min(1, 'Organization name is required')
    .max(150, 'Organization name must not exceed 150 characters'),
  description: z
    .string()
    .regex(/\S/, 'Description must not be only spaces')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  support_email: z
    .string()
    .email('Please provide a valid email address')
    .optional()
    .or(z.literal('')),
  slogan: z
    .string()
    .max(255, 'Slogan must not exceed 255 characters')
    .optional()
    .or(z.literal('')),
  linkedin_company_id: z
    .string()
    .transform((val) => val.trim())
    .refine(
      (val) => val === '' || /^\d{1,10}$/.test(val),
      { message: 'LinkedIn Company ID must be up to 10 digits and numeric only' }
    )
    .optional()
    .or(z.literal('')),


});

export type GeneralInfoFormData = z.infer<typeof generalInfoSchema>;

/**
 * Social Links Schema
 */
export const socialLinksSchema = z.object({
  linkedin_url: z
    .string()
    .refine((val) => !val || linkedinUrlRegex.test(val), {
      message: 'Please provide a valid LinkedIn URL (e.g., https://linkedin.com/company/your-company)',
    })
    .optional()
    .or(z.literal('')),
  facebook_url: z
    .string()
    .refine((val) => !val || facebookUrlRegex.test(val), {
      message: 'Please provide a valid Facebook URL (e.g., https://facebook.com/your-page)',
    })
    .optional()
    .or(z.literal('')),
  twitter_url: z
    .string()
    .refine((val) => !val || twitterUrlRegex.test(val), {
      message: 'Please provide a valid Twitter/X URL (e.g., https://twitter.com/your-handle)',
    })
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .refine((val) => !val || websiteUrlRegex.test(val), {
      message: 'Please provide a valid website URL (must start with http:// or https://)',
    })
    .optional()
    .or(z.literal('')),
});

export type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

/**
 * Branding Schema
 */
export const brandingSchema = z.object({
  logo_url: z
    .string()
    .url('Please provide a valid URL for the logo')
    .optional()
    .or(z.literal('')),
  favicon_url: z
    .string()
    .url('Please provide a valid URL for the favicon')
    .optional()
    .or(z.literal('')),
});

export type BrandingFormData = z.infer<typeof brandingSchema>;

/**
 * Portal Settings Schema
 */
export const portalSettingsSchema = z.object({
  banner_url: z
    .string()
    .url('Please provide a valid URL for the banner')
    .optional()
    .or(z.literal('')),
  portal_enabled: z.boolean().optional(),
});

export type PortalSettingsFormData = z.infer<typeof portalSettingsSchema>;

