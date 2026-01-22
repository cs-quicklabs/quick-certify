/**
 * Settings Schemas
 *
 * Validation schemas for settings forms.
 * Uses shared schemas for consistent validation.
 */

import { z } from 'zod';
import { passwordSchema, optionalNameSchema, PASSWORD_MESSAGES } from './shared.schema';

/**
 * Image Upload Configuration
 */
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];
export const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * Image validation helper
 *
 * @example
 * ```ts
 * const validation = validateImageFile(file);
 * if (!validation.valid) {
 *   showError(validation.error);
 * }
 * ```
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PNG, JPG, and JPEG formats are allowed' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image size must be less than 1MB' };
  }
  return { valid: true };
};

/**
 * Profile Settings Schema
 */
export const profileSettingsSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .regex(/\S/, 'Name must not be only spaces')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Name must only contain letters, numbers')
    .regex(/[a-zA-Z]/, 'Name must contain at least one letter'),
  lastName: optionalNameSchema,
  email: z.string().email('Invalid email address').optional(),
  avatarUrl: z.string().optional(),
  organizationName: z.string().optional(),
  signupMethod: z.enum(['email', 'google']).optional(),
});

export type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;

/**
 * Change Password Schema
 *
 * Uses shared password schema for new password validation.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, PASSWORD_MESSAGES.CONFIRM_REQUIRED),
    revokeAllSessions: z.boolean().optional().default(false),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: PASSWORD_MESSAGES.MISMATCH,
    path: ['confirmPassword'],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

/**
 * Email Preferences Schema
 */
export const emailPreferencesSchema = z.object({
  enableAllAlerts: z.boolean().default(false),
});

export type EmailPreferencesData = z.infer<typeof emailPreferencesSchema>;
