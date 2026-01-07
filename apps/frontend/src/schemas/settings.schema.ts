import { z } from 'zod';

// Allowed image types
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];
export const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB

// Profile Settings Schema
export const profileSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  avatarUrl: z.string().optional(),
  signupMethod: z.enum(['email', 'google']).optional(),
});

export type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;

// Image validation helper
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PNG, JPG, and JPEG formats are allowed' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image size must be less than 1MB' };
  }
  return { valid: true };
};

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
