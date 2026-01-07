import { z } from 'zod';

// Profile Settings Schema
export const profileSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  avatarUrl: z.string().url().optional(),
});

export type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;

// Change Password Schema
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// Email Preferences Schema
export const emailPreferencesSchema = z.object({
  enableAllAlerts: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
  securityAlerts: z.boolean().default(true),
  productUpdates: z.boolean().default(false),
});

export type EmailPreferencesData = z.infer<typeof emailPreferencesSchema>;
